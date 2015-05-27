import { Handle } from 'dojo-core/interfaces';
import Scheduler from 'dojo-core/Scheduler';
import { queueAnimationTask } from 'dojo-core/queue';

const readScheduler = new Scheduler({ queueFunction: queueAnimationTask });
const writeScheduler = new Scheduler({ queueFunction: queueAnimationTask });

export function read(callback: (...args: any[]) => void): Handle {
	return readScheduler.schedule(callback);
}

export function write(callback: (...args: any[]) => void): Handle {
	return writeScheduler.schedule(callback);
}
