import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import { emit } from 'dojo-core/on';
import { Handle } from 'dojo-core/interfaces';
import delegate from 'src/delegate';
import * as dom from 'src/dom';

let container = document.createElement('div');
let handles: (Handle)[] = [];

function testDelegate(...args: any[]) {
	let handle = delegate.apply(null, arguments);
	handles.push(handle);
	return handle;
}

registerSuite({
	name: 'delegate',

	setup() {
		document.body.appendChild(container);
	},

	teardown() {
		document.body.removeChild(container);
	},

	afterEach() {
		while (handles.length > 0) {
			handles.pop().destroy();
		}
		container.innerHTML = '';
	},

	'CSS selector matching multiple elements'() {
		let called = 0;
		let buttonOne = document.createElement('button');
		let buttonTwo = document.createElement('button');

		delegate(container, 'button', 'click', function() {
			called++;
		});

		container.appendChild(buttonOne);
		container.appendChild(buttonTwo);

		buttonOne.click();
		buttonTwo.click();
		assert.strictEqual(called, 2);
	},

	'CSS selector with array of events'() {
		let called = 0;
		let button = document.createElement('button');

		delegate(container, 'button', ['click'], function() {
			called++;
		});

		container.appendChild(button);

		button.click();
		assert.strictEqual(called, 1);
	},

	'CSS selector and text node event target'() {
		let called = 0;
		let div = document.createElement('div');
		div.innerHTML = 'test';

		testDelegate(container, 'div', 'click', function() {
			called++;
		});

		container.appendChild(div);
		
		emit(div, {
			type: 'click',
			bubbles: true,
			cancelable: true
		});

		assert.strictEqual(called, 1);
	},

	'Listening on body'() {
		let called = 0;
		let button = document.createElement('button');

		testDelegate(document.body, 'button', 'click', function() {
			called++;
		});

		document.body.appendChild(button);

		button.click();
		assert.strictEqual(called, 1);
	},

	'Should not throw when selector is not found'() {
		let called = 0;
		let button = document.createElement('button');

		testDelegate(container, 'not-found', 'click', function() {
			called++;
		});

		document.body.appendChild(button);

		button.click();
		assert.strictEqual(called, 0);
	},

	'CSS selector should only match descendants of delegated target'() {
		let called = 0;
		let parent = document.createElement('span');
		let child = document.createElement('button');

		testDelegate(parent, 'div button', 'click', function() {
			called++;
		});

		parent.appendChild(child);
		container.appendChild(parent);

		child.click()
		assert.strictEqual(called, 0);
	},

	'Comma-separated selectors handled correctly'() {
		let called = 0;
		let buttonOne = document.createElement('button');
		let buttonTwo = document.createElement('button');
		buttonOne.className = 'one';
		buttonTwo.className = 'two';

		delegate(container, '.one, .two', 'click', function() {
			called++;
		});

		container.appendChild(buttonOne);
		container.appendChild(buttonTwo);

		buttonOne.click();
		buttonTwo.click();
		assert.strictEqual(called, 2);
	},

	'Double quotes in an existing ID should be escaped'() {
		let called = 0;
		let button = document.createElement('button');

		container.setAttribute('id', 'te"st');

		delegate(container, 'button', 'click', function() {
			called++;
		});

		container.appendChild(button);

		button.click();
		assert.strictEqual(called, 1);
	},

	'Existing ID containing special characters'() {
		let called = 0;
		let button = document.createElement('button');

		container.setAttribute('id', 'te.s-t_:lol');

		delegate(container, 'button', 'click', function() {
			called++;
		});

		container.appendChild(button);

		button.click();
		assert.strictEqual(called, 1);
	}
});
