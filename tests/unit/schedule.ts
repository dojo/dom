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
						operations.push('read');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write');
						resolve();
					});
				})
			]).then(function () {
				// Read queue should fire before write
				assert.deepEqual(operations, [ 'read', 'read', 'write', 'write' ]);
			});
		},

		'write first'() {
			const operations: string[] = [];
			return Promise.all([
				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					write(function () {
						operations.push('write');
						resolve();
					});
				}),

				new Promise(function (resolve, reject) {
					read(function () {
						operations.push('read');
						resolve();
					});
				})
			]).then(function () {
				// Read queue should fire before write
				assert.deepEqual(operations, [ 'read', 'read', 'write', 'write' ]);
			});
		}
	}
});
