import { Handle } from 'dojo-core/interfaces';
import { queueAnimationTask, QueueItem } from 'dojo-core/queue';

const readQueue: QueueItem[] = [];
const writeQueue: QueueItem[] = [];
const deferredReads: QueueItem[] = [];
let isWriting = false;
let task: Handle;

function createHandle(item: QueueItem): Handle {
	return {
		destroy() {
			this.destroy = function () {};
			item.isActive = false;
			item.callback = undefined;
		}
	};
}

function deferRead(item: QueueItem): Handle {
	deferredReads.push(item);
	return createHandle(item);
}

function dispatch() {
	task.destroy();
	task = undefined;

	drain(readQueue);

	isWriting = true;
	drain(writeQueue);
	isWriting = false;

	let item: QueueItem;
	while (item = deferredReads.shift()) {
		enqueue(readQueue, item);
	}
}

function drain(queue: QueueItem[]) {
	let item: QueueItem;
	while (item = queue.shift()) {
		if (item.isActive) {
			item.callback();
		}
	}
}

function enqueue(queue: QueueItem[], item: QueueItem): void {
	if (!task) {
		task = queueAnimationTask(dispatch);
	}
	queue.push(item);
}

function schedule(queue: QueueItem[], callback: (...args: any[]) => void): Handle {
	const item: QueueItem = {
		isActive: true,
		callback: callback
	} 

	if (isWriting && queue === readQueue) {
		return deferRead(item);
	}

	enqueue(queue, item);
	return createHandle(item);
}

/**
 * Schedules a read operation.
 *
 * @param callback a read operation to schedule
 * @returns a handle that can be used to cancel the operation
 */
export function read(callback: (...args: any[]) => void): Handle {
	return schedule(readQueue, callback);
}

/**
 * Schedules a write operation. All scheduled write operations will run after any scheduled read operations.
 *
 * @param callback a write operation to schedule
 * @returns a handle that can be used to cancel the operation
 */
export function write(callback: (...args: any[]) => void): Handle {
	return schedule(writeQueue, callback);
}
