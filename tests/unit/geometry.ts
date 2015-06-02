import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import * as geometry from 'src/geometry';

let element: HTMLElement;
let box: geometry.SettableClientRect;

function createTestElement() {
	return function() {
		element = document.createElement('div');
		const style = element.style;

		style.marginBottom = '9px';
		style.marginLeft = '10px';
		style.marginRight = '11px';
		style.marginTop = '12px';

		style.borderColor = '#000';
		style.borderStyle = 'solid';
		style.borderBottomWidth = '1px';
		style.borderLeftWidth = '2px';
		style.borderRightWidth = '3px';
		style.borderTopWidth = '4px';

		style.paddingBottom = '5px';
		style.paddingLeft = '6px';
		style.paddingRight = '7px';
		style.paddingTop = '8px';

		style.display = 'inline-block';
		style.height = '20px';
		style.width = '30px';
		style.position = 'absolute';
		style.left = '0';
		style.top = '0';

		document.body.appendChild(element);

		return element;
	};
}

function destroyTestElement() {
	return function() {
		element.parentElement.removeChild(element);
	};
}

registerSuite({
	name: 'geometry',

	getters: {
		setup: createTestElement(),

		teardown: destroyTestElement(),

		getBorderBox() {
			const box = geometry.getBorderBox(element);

			assert.deepEqual(box, {
				// Numbers intentionally separated left-to-right and top-to-bottom for correlation to the styles above
				bottom: 12 + 4 + 8 + 20 + 5 + 1,
				height: 4 + 8 + 20 + 5 + 1,
				left: 10,
				right: 10 + 2 + 6 + 30 + 7 + 3,
				top: 12,
				width: 2 + 6 + 30 + 7 + 3
			});
		},

		getContentBox() {
			const box = geometry.getContentBox(element);
			assert.deepEqual(box, {
				bottom: 12 + 4 + 8 + 20,
				height: 20,
				left: 10 + 2 + 6,
				right: 10 + 2 + 6 + 30,
				top: 12 + 4 + 8,
				width: 30
			});
		},

		getMarginBox() {
			const box = geometry.getMarginBox(element);
			assert.deepEqual(box, {
				bottom: 12 + 4 + 8 + 20 + 5 + 1 + 9,
				height: 12 + 4 + 8 + 20 + 5 + 1 + 9,
				left: 0,
				right: 10 + 2 + 6 + 30 + 7 + 3 + 11,
				top: 0,
				width: 10 + 2 + 6 + 30 + 7 + 3 + 11
			});
		},

		getPaddingBox() {
			const box = geometry.getPaddingBox(element);
			assert.deepEqual(box, {
				bottom: 12 + 4 + 8 + 20 + 5,
				height: 8 + 20 + 5,
				left: 10 + 2,
				right: 10 + 2 + 6 + 30 + 7,
				top: 12 + 4,
				width: 6 + 30 + 7
			});
		}
	},

	setters: (function () {
		function testBoxMethod(method: string, boxSizing: string, expected: any) {
			return function() {
				element.style.boxSizing = boxSizing;
				geometry[method](element, box);
				const style = element.style;
				assert.strictEqual(style.top, expected.top);
				assert.strictEqual(style.left, expected.left);
				assert.strictEqual(element.offsetWidth, expected.offsetWidth);
				assert.strictEqual(element.offsetHeight, expected.offsetHeight);
			}
		}
		return {
			setup() {
				box = {
					top: 10,
					left: 15,
					width: 100,
					height: 70
				};
			},
			beforeEach: createTestElement(),

			afterEach: destroyTestElement(),

			setBorderBox: (function() {
				let expected = {
					top: '-2px',
					left: '5px',
					offsetWidth: 100,
					offsetHeight: 70
				};

				return {
					'box-sizing: border-box': testBoxMethod('setBorderBox', 'border-box', expected),
					'box-sizing: content-box': testBoxMethod('setBorderBox', 'content-box', expected)
				}
			})(),

			setContentBox: (function() {
				let expected = {
					top: '-14px',
					left: '-3px',
					offsetWidth: 118,
					offsetHeight: 88
				};

				return {
					'box-sizing: border-box': testBoxMethod('setContentBox', 'border-box', expected),
					'box-sizing: content-box': testBoxMethod('setContentBox', 'content-box', expected)
				}
			})(),

			setMarginBox: (function() {
				let expected = {
					top: '10px',
					left: '15px',
					offsetWidth: 79,
					offsetHeight: 49
				};

				return {
					'box-sizing: border-box': testBoxMethod('setMarginBox', 'border-box', expected),
					'box-sizing: content-box': testBoxMethod('setMarginBox', 'content-box', expected)
				}
			})(),

			setPaddingBox: (function() {
				let expected = {
					top: '-6px',
					left: '3px',
					offsetWidth: 105,
					offsetHeight: 75
				};

				return {
					'box-sizing: border-box': testBoxMethod('setPaddingBox', 'border-box', expected),
					'box-sizing: content-box': testBoxMethod('setPaddingBox', 'content-box', expected)
				}
			})()
		}
	})()
});
