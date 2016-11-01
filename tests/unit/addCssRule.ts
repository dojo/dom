import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import addCssRule, { CssRuleHandle } from '../../src/addCssRule';

registerSuite({
	name: 'addCssRule',

	addCssRule: (function () {
		let handles: CssRuleHandle[] = [];
		let node: HTMLElement;
		let nodeStyle: CSSStyleDeclaration;
		let initialDisplay: string | null;
		let initialStyle: string | null;

		return {
			setup() {
				node = document.createElement('div');
				node.className = 'testDiv';
				document.body.appendChild(node);
				nodeStyle = window.getComputedStyle(node);
				initialDisplay = nodeStyle.display;
				initialStyle = nodeStyle.fontStyle;
			},

			teardown() {
				document.body.removeChild(node);
				node = <any> null;
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
					handles.push(addCssRule('.testDiv', 'font-style: italic; display: inline'));
					assert.strictEqual(nodeStyle.display, 'inline');
					assert.strictEqual(nodeStyle.fontStyle, 'italic');
				}
			} ,

			'add multiple rules'() {
				const handle1 = addCssRule('.testDiv', 'display: inline;');
				handles.push(handle1);
				const handle2 = addCssRule('.testDiv', 'font-style: italic;');
				handles.push(handle2);

				assert.strictEqual(nodeStyle.display, 'inline');
				assert.strictEqual(nodeStyle.fontStyle, 'italic');

				handle1.destroy();
				assert.strictEqual(nodeStyle.display, initialDisplay);
				assert.strictEqual(nodeStyle.fontStyle, 'italic');

				handle2.destroy();
				assert.strictEqual(nodeStyle.display, initialDisplay);
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
					const handle = addCssRule('.testDiv', 'display: inline;');
					handle.destroy();
					// Verify that that styles were removed
					assert.equal(nodeStyle.display, initialDisplay);
				},

				'use after destroy'() {
					const handle = addCssRule('.testDiv', 'display: inline;');
					handle.destroy();

					assert.doesNotThrow(function () {
						handle.destroy();
					});

					handle.set('display', 'inline');
					assert.strictEqual(nodeStyle.display, initialDisplay,
						'display style should not be applied after rule was destroyed');
					assert.isNull(handle.get('display'),
						'get should always return null when called on a destroyed rule');

					assert.doesNotThrow(function () {
						handle.remove('display');
					});
				},

				'destroy out of order'() {
					const handle1 = addCssRule('.testDiv', 'display: inline-block;');
					handles.push(handle1);
					const handle2 = addCssRule('.testDiv', 'display: table-cell;');
					handles.push(handle2);
					const handle3 = addCssRule('.testDiv', 'display: inline;');
					handles.push(handle3);

					assert.strictEqual(nodeStyle.display, 'inline');

					handle1.destroy();
					assert.strictEqual(nodeStyle.display, 'inline');
					handle3.destroy();
					assert.strictEqual(nodeStyle.display, 'table-cell');
					handle2.destroy();
					assert.strictEqual(nodeStyle.display, initialDisplay);
				}
			},

			'#get'() {
				const handle = addCssRule('.testDiv', 'display: inline; font-style: italic;');
				handles.push(handle);
				assert.strictEqual(handle.get('display'), 'inline');
				assert.strictEqual(handle.get('font-style'), 'italic');

			},

			'#remove'() {
				const handle = addCssRule('.testDiv', 'display: inline; font-style: italic;');
				handles.push(handle);
				handle.remove('display');

				// Verify that that only display was removed
				assert.strictEqual(nodeStyle.display, initialDisplay);
				assert.strictEqual(nodeStyle.fontStyle, 'italic');
			},

			'#set': {
				single() {
					const handle = addCssRule('.testDiv', '');
					handles.push(handle);
					handle.set('display', 'inline');

					// Check that property retrieval works
					assert.strictEqual(handle.get('display'), 'inline');

					// Verify that that the style is actually applied to the page
					assert.strictEqual(nodeStyle.display, 'inline');
				},

				multiple() {
					const handle = addCssRule('.testDiv', '');
					handles.push(handle);
					handle.set({ 'display': 'inline', 'font-style': 'italic' });

					// Check that property retrieval works
					assert.strictEqual(handle.get('display'), 'inline');
					assert.strictEqual(handle.get('font-style'), 'italic');

					// Verify that that the style is actually applied to page
					assert.strictEqual(nodeStyle.display, 'inline');
					assert.strictEqual(nodeStyle.fontStyle, 'italic');
				}
			}
		};
	})()
});
