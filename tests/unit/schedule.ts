import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import { read, write} from 'src/schedule';
import Promise from 'dojo-core/Promise';

registerSuite({
	read() {
		const dfd = this.async();
		read(dfd.callback(function () {}));
	},

	write() {
		const dfd = this.async();
		write(dfd.callback(function () {}));
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
				// Read queue should fire before write
				assert.deepEqual(operations, [ 'read1', 'read2', 'write1', 'write2' ]);
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
				// Read queue should fire before write
				assert.deepEqual(operations, [ 'read1', 'read2', 'write1', 'write2' ]);
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
				}),
			]).then(function () {
				// Read queue should fire before write
				assert.deepEqual(operations, [ 'write1', 'write2', 'read3', 'read4' ]);
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
				}),
			]).then(function () {
				// Read queue should fire before write
				assert.deepEqual(operations, [ 'read1', 'read2', 'write' ]);
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
				// Read queue should fire before write
				assert.deepEqual(operations, [ 'read1', 'read2', 'write1', 'read3' ]);
			});
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

			're-destroy'() {
				const handle = read(function () {});
				handle.destroy();
				// Check that calling it again doesn't throw
				handle.destroy();
			}
		}
	}
});
