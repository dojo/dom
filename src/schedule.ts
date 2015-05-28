import { Handle } from 'dojo-core/interfaces';
import { queueAnimationTask, QueueItem } from 'dojo-core/queue';

let deferredReads: QueueItem[] = [];
let isWriting = false;
let readQueue: QueueItem[] = [];
let task: Handle;
const writeQueue: QueueItem[] = [];

function createHandle(item: QueueItem): Handle {
	return {
		destroy() {
			this.destroy = function () {};
			item.isActive = false;
			item.callback = undefined;
		}
	};
}

function dispatch() {
	task.destroy();
	task = undefined;

	drain(readQueue);

	isWriting = true;
	drain(writeQueue);
	isWriting = false;

	if (deferredReads.length > 0) {
		readQueue = readQueue.concat(deferredReads);
		deferredReads = [];
		task = task || queueAnimationTask(dispatch);
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

function schedule(queue: QueueItem[], callback: (...args: any[]) => void): Handle {
	const item: QueueItem = {
		isActive: true,
		callback: callback
	} 

	if (isWriting && queue === readQueue) {
		deferredReads.push(item);
	}
	else {
		queue.push(item);
		task = task || queueAnimationTask(dispatch);
	}

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
