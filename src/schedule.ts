import { Handle } from 'dojo-core/interfaces';
import { queueAnimationTask, QueueItem } from 'dojo-core/queue';

const readQueue: QueueItem[] = [];
const writeQueue: QueueItem[] = [];
let task: Handle | undefined;

function createHandle(item: QueueItem): Handle {
	return {
		destroy(this: Handle) {
			this.destroy = function () {};
			item.isActive = false;
			item.callback = null;
		}
	};
}

function drain(queue: QueueItem[]) {
	let item: QueueItem | undefined;
	while (item = queue.shift()) {
		if (item.isActive && item.callback) {
			item.callback();
		}
	}
}

function dispatch() {
	drain(readQueue);
	drain(writeQueue);

	// If more reads were scheduled during processing of the write queue, schedule another run immediately
	task = readQueue.length ? queueAnimationTask(dispatch) : undefined;
}

function schedule(queue: QueueItem[], callback: (...args: any[]) => void): Handle {
	const item: QueueItem = {
		isActive: true,
		callback: callback
	};

	queue.push(item);

	// Schedule a run if one hasn't yet been scheduled.
	// Note that due to logic in dispatch, this purposely won't schedule a new run if more tasks are added
	// during a previous run, since the read/write queues will be fully drained (in order),
	// and dispatch handles queueing up another run if more read operations are queued while draining the write queue.
	task = task || queueAnimationTask(dispatch);

	return createHandle(item);
}

/**
 * Schedules a read operation.
 *
 * @param callback A function containing read operations to schedule
 * @return A handle that can be used to cancel the operation
 */
export function read(callback: (...args: any[]) => void): Handle {
	return schedule(readQueue, callback);
}

/**
 * Schedules a write operation. Scheduled write operations will run after any scheduled read operations.
 *
 * @param callback A function containing write operations to schedule
 * @return A handle that can be used to cancel the operation
 */
export function write(callback: (...args: any[]) => void): Handle {
	return schedule(writeQueue, callback);
}
