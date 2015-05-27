import { Handle } from 'dojo-core/interfaces';
import Scheduler from 'dojo-core/Scheduler';
import { queueAnimationTask, QueueItem } from 'dojo-core/queue';

/**
 * Specifies a read or write operation
 */
enum Operation {
	READ,
	WRITE
}

/**
 * A QueueItem representing a particular type of operation.
 */
interface DomQueueItem extends QueueItem {
	operation: Operation;
}

/**
 * An extension of Scheduler that allows read and write operations to be scheduled and dispatched in the proper order.
 */
class DomScheduler extends Scheduler {
	/**
	 * Overrides Scheduler#_dispatch to ensure that reads happen before writes.
	 */
	protected _dispatch(): void {
		const reads: DomQueueItem[] = [];
		const writes: DomQueueItem[] = [];
		const queue = <DomQueueItem[]> this._queue;

		for (const item of queue) {
			(item.operation === Operation.READ ? reads : writes).push(item);
		}

		this._queue = reads.concat(writes);
		super._dispatch();
	}

	/**
	 * Schedules a read or write operation.
	 */
	scheduleOperation(callback: (...args: any[]) => void, operation: Operation): Handle {
		return this._schedule({
			isActive: true,
			callback: callback,
			operation: operation
		});
	}
}

const scheduler = new DomScheduler({ queueFunction: queueAnimationTask });

/**
 * Schedules a read operation.
 *
 * @param callback a read operation to schedule
 * @returns a handle that can be used to cancel the operation
 */
export function read(callback: (...args: any[]) => void): Handle {
	return scheduler.scheduleOperation(callback, Operation.READ);
}

/**
 * Schedules a write operation. All scheduled write operations will run after any scheduled read operations.
 *
 * @param callback a write operation to schedule
 * @returns a handle that can be used to cancel the operation
 */
export function write(callback: (...args: any[]) => void): Handle {
	return scheduler.scheduleOperation(callback, Operation.WRITE);
}
