import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import { emit } from 'dojo-core/on';
import { Handle } from 'dojo-core/interfaces';
import delegate from '../../src/delegate';

let container = document.createElement('div');
let handles: Handle[] = [];

registerSuite({
	name: 'delegate',

	setup() {
		document.body.appendChild(container);
	},

	teardown() {
		document.body.removeChild(container);
	},

	afterEach() {
		for (let handle of handles) {
			handle.destroy();
		}
		handles = [];
		container.innerHTML = '';
		container.removeAttribute('id');
	},

	'CSS selector matching multiple elements, added after event is registered'() {
		let called = 0;
		let buttonOne = document.createElement('button');
		let buttonTwo = document.createElement('button');

		handles.push(delegate(container, 'button', 'click', function () {
			called++;
		}));

		container.appendChild(buttonOne);
		container.appendChild(buttonTwo);

		buttonOne.click();
		buttonTwo.click();
		assert.strictEqual(called, 2);
	},

	'CSS selector with array of events'() {
		let called = 0;
		let button = document.createElement('button');

		handles.push(delegate(container, 'button', [ 'click' ], function () {
			called++;
		}));

		container.appendChild(button);

		button.click();
		assert.strictEqual(called, 1);
	},

	'CSS selector matching a node in between the delegation root and the event target'() {
		let called = 0;
		let button = document.createElement('button');
		let div = document.createElement('div');

		handles.push(delegate(container, 'div', 'click', function () {
			called++;
		}));

		div.appendChild(button);
		container.appendChild(div);

		button.click();
		assert.strictEqual(called, 1);
	},

	'Text node event target'() {
		let called = 0;
		let div = document.createElement('div');
		div.innerHTML = 'test';

		handles.push(delegate(container, 'div', 'click', function () {
			called++;
		}));

		container.appendChild(div);

		emit(div.firstChild, {
			type: 'click',
			bubbles: true,
			cancelable: true
		});

		assert.strictEqual(called, 1);
	},

	'Listening on body'() {
		let called = 0;
		let button = document.createElement('button');

		handles.push(delegate(document.body, 'button', 'click', function () {
			called++;
		}));

		container.appendChild(button);

		button.click();
		assert.strictEqual(called, 1);
	},

	'Should not fire when selector is not found'() {
		let called = 0;
		let button = document.createElement('button');

		handles.push(delegate(container, 'not-found', 'click', function () {
			called++;
		}));

		document.body.appendChild(button);

		button.click();
		assert.strictEqual(called, 0);
	},

	'CSS selector must not match ancestors of delegated target'() {
		let called = 0;
		let parent = document.createElement('span');
		let child = document.createElement('button');

		handles.push(delegate(parent, 'div', 'click', function () {
			called++;
		}));

		parent.appendChild(child);
		container.appendChild(parent);

		child.click();
		assert.strictEqual(called, 0);
	},

	'CSS selector should only match descendants of delegated target'() {
		let called = 0;
		let parent = document.createElement('span');
		let child = document.createElement('button');

		handles.push(delegate(parent, 'div button', 'click', function () {
			called++;
		}));
		handles.push(delegate(parent, 'span button', 'click', function () {
			called++;
		}));

		parent.appendChild(child);
		container.appendChild(parent);

		child.click();
		assert.strictEqual(called, 0);
	},

	'Comma-separated selector handling'() {
		let called = 0;
		let buttonOne = document.createElement('button');
		let buttonTwo = document.createElement('button');
		buttonOne.className = 'one';
		buttonTwo.className = 'two';

		handles.push(delegate(container, '.one, .two', 'click', function () {
			called++;
		}));

		container.appendChild(buttonOne);
		container.appendChild(buttonTwo);

		buttonOne.click();
		buttonTwo.click();
		assert.strictEqual(called, 2);
	},

	'Double quotes in an existing ID should be escaped in the applied selector'() {
		let called = 0;
		let button = document.createElement('button');

		container.setAttribute('id', 'te"st');

		handles.push(delegate(container, 'button', 'click', function () {
			called++;
		}));

		container.appendChild(button);

		button.click();
		assert.strictEqual(called, 1);
	},

	'Delegate on element with existing ID containing special characters'() {
		let called = 0;
		let button = document.createElement('button');

		container.setAttribute('id', 't,e.s t_:');

		handles.push(delegate(container, 'button', 'click', function () {
			called++;
		}));

		container.appendChild(button);

		button.click();
		assert.strictEqual(called, 1);
	},

	'Delegate on ID-less element using invalid selector'() {
		let button = document.createElement('button');

		handles.push(delegate(container, 'button.', 'click', function () {}));

		container.appendChild(button);
		button.click();
		assert.strictEqual(container.id, '', 'container ID should be reverted even if matches throws');
	}
});
