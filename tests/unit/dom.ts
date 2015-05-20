import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import * as dom from 'src/dom';

let element: HTMLElement;

registerSuite({
	name: 'dom',

	setup() {
		element = document.createElement('span');
		element.id = 'id';
	},

	teardown() {
		element.parentElement.removeChild(element);
	},

	byId: {
		'result found'() {
			document.body.appendChild(element);
			assert.strictEqual(dom.byId('id').id, 'id');
		},

		'result not found'() {
			assert.isNull(dom.byId('undefined'));
		}
	},

	fromString: (function () {
		function assertHierarchy(fragment: DocumentFragment, ...nodeNames: string[]) {
			// Used for concisely testing special cases where parent nodes are implicitly created
			let node: Node = fragment;
			for (let i = 0; i < nodeNames.length; i++) {
				node = node.firstChild;
				assert.strictEqual(node.nodeName, nodeNames[i]);
			}
		}

		return {
			'returns document fragment for single node'() {
				let result = dom.fromString('<div></div>');
				assert.strictEqual(result.firstChild.nodeName, 'DIV');
				assert.strictEqual(result.nodeName, '#document-fragment');
			},

			'returns correct fragment for tree'() {
				let parent = document.createElement('div');
				let child = document.createElement('span');

				parent.appendChild(child);
				let fragment = dom.fromString(parent.outerHTML);

				assert.strictEqual((<HTMLElement> fragment.firstChild).outerHTML, parent.outerHTML);
			},

			'returns correct fragment for forest'() {
				let parent = document.createElement('div');
				let children = [
					document.createElement('span'),
					document.createElement('div')
				];

				for (let child of children) {
					parent.appendChild(child);
				}

				let fragment = dom.fromString(parent.innerHTML);
				for (let i in children) {
					assert.strictEqual(fragment.childNodes[i].nodeName,
						parent.childNodes[i].nodeName);
				}
			},

			'<option> created inside <select>'() {
				let fragment = dom.fromString('<option></option>');
				assertHierarchy(fragment, 'SELECT', 'OPTION');
			},

			'<tbody> created inside <table>'() {
				let fragment = dom.fromString('<tbody></tbody>');
				assertHierarchy(fragment, 'TABLE', 'TBODY');
			},

			'<thead> created inside <table>'() {
				let fragment = dom.fromString('<thead></thead>');
				assertHierarchy(fragment, 'TABLE', 'THEAD');
			},

			'<tfoot> created inside <table>'() {
				let fragment = dom.fromString('<tfoot></tfoot>');
				assertHierarchy(fragment, 'TABLE', 'TFOOT');
			},

			'<tr> created inside <tbody> inside <table>'() {
				let fragment = dom.fromString('<tr></tr>');
				assertHierarchy(fragment, 'TABLE', 'TBODY', 'TR');
			},

			'<td> created inside <tr> inside <tbody> inside <table>'() {
				let fragment = dom.fromString('<td></td>');
				assertHierarchy(fragment, 'TABLE', 'TBODY', 'TR', 'TD');
			},

			'<td> created inside <tr> inside <thead> inside <table>'() {
				let fragment = dom.fromString('<th></th>');
				assertHierarchy(fragment, 'TABLE', 'THEAD', 'TR', 'TH');
			},

			'<legend> created inside <fieldset>'() {
				let fragment = dom.fromString('<legend></legend>');
				assertHierarchy(fragment, 'FIELDSET', 'LEGEND');
			},

			'<caption> created inside <table>'() {
				let fragment = dom.fromString('<caption></caption>');
				assertHierarchy(fragment, 'TABLE', 'CAPTION');
			},

			'<colgroup> created inside <table>'() {
				let fragment = dom.fromString('<colgroup></colgroup>');
				assertHierarchy(fragment, 'TABLE', 'COLGROUP');
			},

			'<col> created inside <colgroup> inside <table>'() {
				let fragment = dom.fromString('<col></col>');
				assertHierarchy(fragment, 'TABLE', 'COLGROUP', 'COL');
			},

			'<li> created inside <ul>'() {
				let fragment = dom.fromString('<li></li>');
				assertHierarchy(fragment, 'UL', 'LI');
			}
		};
	})(),

	place: (function () {
		function createBeforeOrAfterTest(position: dom.Position) {
			const siblingProperty = position === dom.Position.Before ? 'previousSibling' : 'nextSibling';

			return function () {
				let node = document.createElement('div');
				let parent = document.createElement('div');
				let relativeElement = document.createElement('div');
				parent.appendChild(relativeElement);

				dom.place(node, position, relativeElement);
				// TS7017
				assert.strictEqual((<any> relativeElement)[siblingProperty], node);
			};
		}

		function createFirstOrLastTest(position: dom.Position) {
			const childProperty = position === dom.Position.FirstIn ? 'firstChild' : 'lastChild';
			const name = 'dom.Position.' + (position === dom.Position.FirstIn ? 'FirstIn' : 'LastIn');

			return function () {
				let node = document.createElement('div');
				let relativeElement = document.createElement('div');

				dom.place(node, position, relativeElement);
				// TS7017
				assert.strictEqual((<any> relativeElement)[childProperty], node,
					name + ' should insert node as child even if relativeElement has no children');
				assert.strictEqual(relativeElement.children.length, 1,
					'The placed node should be the only child');

				node = document.createElement('div');
				dom.place(node, position, relativeElement);
				// TS7017
				assert.strictEqual((<any> relativeElement)[childProperty], node,
					name + ' should insert node at correct end if relativeElement has children');
				assert.strictEqual(relativeElement.children.length, 2,
					'relativeElement should have one more child after placement');
			};
		}

		return {
			'should throw if relativeElement has no parent, for sibling placement options only'() {
				let node = document.createElement('div');
				let reference = document.createElement('div');

				// TS4091
				for (var position of [ dom.Position.After, dom.Position.Before, dom.Position.Replace ]) {
					assert.throws(function () {
						dom.place(node, position, reference);
					}, ReferenceError);
				}
				for (var position of [ dom.Position.FirstIn, dom.Position.LastIn ]) {
					assert.doesNotThrow(function () {
						dom.place(node, position, reference);
					});
				}
			},

			'when position argument is Position.Before, the node is placed before relativeElement':
				createBeforeOrAfterTest(dom.Position.Before),

			'when position argument is Position.After, the node is placed after relativeElement':
				createBeforeOrAfterTest(dom.Position.After),

			'when position argument is Position.Replace, the node replaces relativeElement'() {
				let container = document.createElement('div');
				let node = document.createElement('div');
				let reference = document.createElement('div');

				container.appendChild(reference);
				dom.place(node, dom.Position.Replace, reference);
				assert.strictEqual(container.firstChild, node);
			},

			'when position argument is Position.FirstIn, the node is placed as first child of relativeElement':
				createFirstOrLastTest(dom.Position.FirstIn),

			'when position argument is Position.LastIn, the node is placed as last child of relativeElement':
				createFirstOrLastTest(dom.Position.LastIn)
		};
	})(),

	remove: {
		'should not throw if node has no parent'() {
			let node = document.createElement('div');
			assert.doesNotThrow(function () {
				dom.remove(node);
			});
		},

		'should remove element from its parent'() {
			let parent = document.createElement('div');
			let node = document.createElement('div');

			parent.appendChild(node);
			assert.strictEqual(parent.children.length, 1);
			assert.strictEqual(node.parentNode, parent);

			dom.remove(node);
			assert.strictEqual(parent.children.length, 0);
			assert.isNull(node.parentNode);
		}
	},

	'CSS manipulation': (function () {
		function cssSuite(element: Element): {} {
			let targetElement = <any> element;
			return {
				addClass: {
					afterEach() {
						targetElement.className = '';
					},

					'add single class'() {
						assert.notInclude(targetElement.className, 'test');
						dom.addClass(targetElement, 'test');
						assert.include(targetElement.className, 'test');
					},

					'add multiple classes'() {
						dom.addClass(targetElement, 'test1', 'test2');
						assert.include(targetElement.className, 'test1');
						assert.include(targetElement.className, 'test2');
					},

					'null node should not throw'() {
						assert.doesNotThrow(function () {
							dom.addClass(null, 'test');
						});
					},

					'invalid class should throw'() {
						assert.throws(function () {
							dom.addClass(targetElement, 'te est');
						});
						assert.throws(function () {
							dom.addClass(targetElement, '');
						});
					},

					'null class should add "null" to className'() {
						assert.doesNotThrow(function () {
							dom.addClass(targetElement, null);
							assert.include(targetElement.className, 'null');
						});
					},

					'no class should not throw'() {
						assert.doesNotThrow(function () {
							dom.addClass(targetElement);
						});
					},

					'existing class should not get re-added'() {
						dom.addClass(targetElement, 'test');
						dom.addClass(targetElement, 'test');
						assert.lengthOf(targetElement.className.match(/test/g), 1);
					}
				},

				containsClass: {
					afterEach() {
						targetElement.className = '';
					},

					'contains single class'() {
						dom.addClass(targetElement, 'test');
						assert.isTrue(dom.containsClass(element, 'test'));
					},

					'null node should not throw'() {
						assert.doesNotThrow(function () {
							dom.containsClass(null, 'test');
						});
					},

					'invalid class should throw'() {
						assert.throws(function () {
							dom.containsClass(targetElement, 'te est');
						});
						assert.throws(function () {
							dom.containsClass(targetElement, '');
						});
					},

					'null class should check for "null" CSS class'() {
						assert.doesNotThrow(function () {
							assert.isFalse(dom.containsClass(targetElement, null));
							dom.addClass(targetElement, null);
							assert.isTrue(dom.containsClass(targetElement, null));
						});
					},

					'no class should throw'() {
						assert.throws(function () {
							dom.containsClass.call(dom, targetElement);
						});
					},

					'should not match partial class names'() {
						dom.addClass(targetElement, 'foobar');
						assert.isTrue(dom.containsClass(targetElement, 'foobar'));
						assert.isFalse(dom.containsClass(targetElement, 'foo'));
					}
				},

				removeClass: {
					afterEach() {
						targetElement.className = '';
					},

					'remove single class'() {
						dom.addClass(targetElement, 'test');
						assert.include(targetElement.className, 'test');
						dom.removeClass(targetElement, 'test');
						assert.notInclude(targetElement.className, 'test');
					},

					'remove multiple classes'() {
						targetElement.className = 'test1 test2';
						assert.include(targetElement.className, 'test1');
						assert.include(targetElement.className, 'test2');
						dom.removeClass(targetElement, 'test1', 'test2');
						assert.notInclude(targetElement.className, 'test1');
						assert.notInclude(targetElement.className, 'test2');
					},

					'null node should not throw'() {
						assert.doesNotThrow(function () {
							dom.removeClass(null, 'test');
						});
					},

					'invalid class should throw'() {
						assert.throws(function () {
							dom.removeClass(targetElement, 'te est');
						});
						assert.throws(function () {
							dom.removeClass(targetElement, '');
						});
					},

					'null class should remove "null" from className'() {
						assert.doesNotThrow(function () {
							dom.addClass(targetElement, null);
							dom.removeClass(targetElement, null);
							assert.notInclude(targetElement.className, 'null');
						});
					},

					'no class should not throw'() {
						assert.doesNotThrow(function () {
							dom.removeClass(targetElement);
						});
					},

					'remove nonexistent class'() {
						dom.addClass(targetElement, 'test');
						assert.doesNotThrow(function () {
							dom.removeClass(targetElement, 'random');
						});
						assert.include(targetElement.className, 'test');

						assert.doesNotThrow(function () {
							dom.removeClass(targetElement, 'random', 'random1');
						});
					}
				},

				toggleClass: {
					'toggling existing class removes it'() {
						dom.addClass(targetElement, 'test');
						assert.include(targetElement.className, 'test');
						dom.toggleClass(targetElement, 'test');
						assert.notInclude(targetElement.className, 'test');
					},

					'toggling nonexistent class adds it'() {
						dom.toggleClass(targetElement, 'test');
						assert.include(targetElement.className, 'test');
					},

					'toggling class using force = true'() {
						dom.toggleClass(targetElement, 'test', true);
						assert.include(targetElement.className, 'test');
						dom.toggleClass(targetElement, 'test', true);
						assert.include(targetElement.className, 'test');
					},

					'toggling class using force = false'() {
						dom.toggleClass(targetElement, 'test', false);
						assert.notInclude(targetElement.className, 'test');
						dom.addClass(targetElement, 'test');
						dom.toggleClass(targetElement, 'test', false);
						assert.notInclude(targetElement.className, 'test');
					},

					'null node should not throw'() {
						assert.doesNotThrow(function () {
							dom.toggleClass(null, 'test');
						});
					},

					'invalid class should throw'() {
						assert.throws(function () {
							dom.toggleClass(targetElement, 'te st');
						});
						assert.throws(function () {
							dom.toggleClass(targetElement, '');
						});
					},

					'null class should toggle "null" on className'() {
						assert.doesNotThrow(function () {
							dom.toggleClass(targetElement, null);
							assert.include(targetElement.className, 'null');
							dom.toggleClass(targetElement, null);
							assert.notInclude(targetElement.className, 'null');
						});
					},

					'no class should throw'() {
						assert.throws(function () {
							dom.toggleClass.call(dom, targetElement);
						});
					}
				}
			};
		}

		return {
			HTMLElement: cssSuite(document.createElement('div')),
			SVGElement: cssSuite(document.createElement('svg'))
		};
	})()
});
