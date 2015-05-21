import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import addCssRule, { CssRuleHandle } from 'src/addCssRule';

registerSuite({
	name: 'addCssRule',

	addCssRule: (function () {
		let handles: CssRuleHandle[] = [];
		let node: HTMLElement;
		let nodeStyle: CSSStyleDeclaration;
		let initialSize: string;
		let initialStyle: string;

		return {
			setup() {
				node = document.createElement('div');
				node.className = 'testDiv';
				document.body.appendChild(node);
				nodeStyle = window.getComputedStyle(node);
				initialSize = nodeStyle.fontSize;
				initialStyle = nodeStyle.fontStyle;
			},

			teardown() {
				document.body.removeChild(node);
				node = null;
			},

			afterEach() {
				for (const handle of handles) {
					handle.destroy();
				}
				handles = [];
			},

			'add rule': {
				empty() {
					assert.doesNotThrow(function () {
						addCssRule('.testDiv', '');
					});
				},

				'multiple properties'() {
					handles.push(addCssRule('.testDiv', 'font-size: 4px; font-style: italic;'));
					assert.strictEqual(nodeStyle.fontSize, '4px');
					assert.strictEqual(nodeStyle.fontStyle, 'italic');
				}
			},

			'add multiple rules'() {
				const handle1 = addCssRule('.testDiv', 'font-size: 4px;');
				handles.push(handle1);
				const handle2 = addCssRule('.testDiv', 'font-style: italic;');
				handles.push(handle2);

				assert.strictEqual(nodeStyle.fontSize, '4px');
				assert.strictEqual(nodeStyle.fontStyle, 'italic');

				handle1.destroy();
				assert.strictEqual(nodeStyle.fontSize, initialSize);
				assert.strictEqual(nodeStyle.fontStyle, 'italic');

				handle2.destroy();
				assert.strictEqual(nodeStyle.fontSize, initialSize);
				assert.strictEqual(nodeStyle.fontStyle, initialStyle);
			},

			'protected properties are non-enumerable'() {
				const handle = addCssRule('.testDiv', '');
				handles.push(handle);
				assert.notInclude(Object.keys(handle), '_index');
				assert.notInclude(Object.keys(handle), '_style');
			},

			'#destroy': {
				'styles removed'() {
					const handle = addCssRule('.testDiv', 'font-size: 4px;');
					handle.destroy();
					// Verify that that styles were removed
					assert.equal(nodeStyle.fontSize, initialSize);
				},

				'use after destroy'() {
					const handle = addCssRule('.testDiv', 'font-size: 4px;');
					handle.destroy();

					assert.doesNotThrow(function () {
						handle.destroy();
					});

					handle.set('font-size', '4px');
					assert.strictEqual(nodeStyle.fontSize, initialSize,
						'font-size style should not be applied after rule was destroyed');
					assert.isNull(handle.get('font-size'),
						'get should always return null when called on a destroyed rule');

					assert.doesNotThrow(function () {
						handle.remove('font-size');
					});
				},

				'destroy out of order'() {
					const handle1 = addCssRule('.testDiv', 'font-size: 4px;');
					handles.push(handle1);
					const handle2 = addCssRule('.testDiv', 'font-size: 5px;');
					handles.push(handle2);
					const handle3 = addCssRule('.testDiv', 'font-size: 6px;');
					handles.push(handle3);

					assert.strictEqual(nodeStyle.fontSize, '6px');

					handle1.destroy();
					assert.strictEqual(nodeStyle.fontSize, '6px');
					handle3.destroy();
					assert.strictEqual(nodeStyle.fontSize, '5px');
					handle2.destroy();
					assert.strictEqual(nodeStyle.fontSize, initialSize);
				}
			},

			'#get'() {
				const handle = addCssRule('.testDiv', 'font-size: 4px; font-style: italic;');
				handles.push(handle);
				assert.strictEqual(handle.get('font-size'), '4px');
				assert.strictEqual(handle.get('font-style'), 'italic');

			},

			'#remove'() {
				const handle = addCssRule('.testDiv', 'font-size: 4px; font-style: italic;');
				handles.push(handle);
				handle.remove('font-size');

				// Verify that that only font-size was removed
				assert.strictEqual(nodeStyle.fontSize, initialSize);
				assert.strictEqual(nodeStyle.fontStyle, 'italic');
			},

			'#set': {
				single() {
					const handle = addCssRule('.testDiv', '');
					handles.push(handle);
					handle.set('font-size', '4px');

					// Check that property retrieval works
					assert.strictEqual(handle.get('font-size'), '4px');

					// Verify that that the style is actually applied to the page
					assert.strictEqual(nodeStyle.fontSize, '4px');
				},

				multiple() {
					const handle = addCssRule('.testDiv', '');
					handles.push(handle);
					handle.set({ 'font-size': '4px', 'font-style': 'italic' });

					// Check that property retrieval works
					assert.strictEqual(handle.get('font-size'), '4px');
					assert.strictEqual(handle.get('font-style'), 'italic');

					// Verify that that the style is actually applied to page
					assert.strictEqual(nodeStyle.fontSize, '4px');
					assert.strictEqual(nodeStyle.fontStyle, 'italic');
				}
			}
		};
	})()
});
