import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import { read, write } from 'src/schedule';
import Promise from 'dojo-shim/Promise';

registerSuite({
	read() {
		const dfd = this.async();
		read(dfd.callback(function () {}));
	},

	write() {
		const dfd = this.async();
		write(dfd.callback(function () {}));
	},

	destroy: {
		read() {
			let didRead = false;
			const handle = read(function () {
				didRead = true;
			});
			handle.destroy();

			const dfd = this.async();
			setTimeout(dfd.callback(function () {
				assert.isFalse(didRead);
			}), 100);
		},

		write() {
			let didWrite = false;
			const handle = read(function () {
				didWrite = true;
			});
			handle.destroy();

			const dfd = this.async();
			setTimeout(dfd.callback(function () {
				assert.isFalse(didWrite);
			}), 100);
		},

		'multiple reads and writes'() {
			const operations: string[] = [];
			const readPromise1 = new Promise(function (resolve, reject) {
				read(function () {
					operations.push('read1');
					resolve();
				});
			});

			const readHandle = read(function () {
				operations.push('read1.5');
			});

			const writePromise1 = new Promise(function (resolve, reject) {
				write(function () {
					operations.push('write1');
					resolve();
				});
			});

			const writeHandle = write(function () {
				operations.push('write1.5');
			});

			const readPromise2 = new Promise(function (resolve, reject) {
				read(function () {
					operations.push('read2');
					resolve();
				});
			});

			const writePromise2 = new Promise(function (resolve, reject) {
				write(function () {
					operations.push('write2');
					resolve();
				});
			});

			readHandle.destroy();
			writeHandle.destroy();

			return Promise.all([ readPromise1, readPromise2, writePromise1, writePromise2 ]).then(function () {
				assert.deepEqual(operations, [ 'read1', 'read2', 'write1', 'write2' ],
					'Read queue should drain before write, and destroyed items should not run');
			});
		},

		're-destroy'() {
			const handle = read(function () {});
			handle.destroy();
			assert.doesNotThrow(function () {
				handle.destroy();
			});
		}
	},

	order: {
		'read first'() {
			const operations: string[] = [];
			return Promise.all([
				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read1');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write1');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read2');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write2');
						resolve();
					});
				})
			]).then(function () {
				assert.deepEqual(operations, [ 'read1', 'read2', 'write1', 'write2' ],
					'Read queue should drain before write queue');
			});
		},

		'write first'() {
			const operations: string[] = [];
			return Promise.all([
				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write1');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read1');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write2');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read2');
						resolve();
					});
				})
			]).then(function () {
				assert.deepEqual(operations, [ 'read1', 'read2', 'write1', 'write2' ],
					'Read queue should drain before write queue');
			});
		},

		'reads within writes'() {
			const operations: string[] = [];
			return Promise.all([
				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write1');
						read(function () {
							operations.push('read3');
							resolve();
						});
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write2');
						read(function () {
							operations.push('read4');
							resolve();
						});
					});
				})
			]).then(function () {
				assert.deepEqual(operations, [ 'write1', 'write2', 'read3', 'read4' ],
					'Reads queued while draining write queue should not fire until next turn');
			});
		},

		'reads within reads before writes'() {
			const operations: string[] = [];
			return Promise.all([
				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read1');
						read(function () {
							operations.push('read2');
							resolve();
						});
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write');
						resolve();
					});
				})
			]).then(function () {
				assert.deepEqual(operations, [ 'read1', 'read2', 'write' ],
					'Read queue should drain before write queue, even if more reads are queued while draining it');
			});
		},

		'reads within writes after writes'() {
			const operations: string[] = [];
			return Promise.all([
				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read1');
						read(function () {
							operations.push('read2');
							resolve();
						});
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write1');
						read(function () {
							operations.push('read3');
							resolve();
						});
					});
				})
			]).then(function () {
				assert.deepEqual(operations, [ 'read1', 'read2', 'write1', 'read3' ],
					'Read queue should drain before write queue, except for reads queued while draining write queue');
			});
		}
	}
});
