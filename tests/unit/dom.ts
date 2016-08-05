import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import { add as hasAdd, testCache as hasCache } from 'dojo-has/has';
import * as dom from 'src/dom';
import { CreateArgs } from 'src/interfaces';

let element: HTMLElement;

registerSuite({
	name: 'dom',

	applyFeatureClass: (function () {
		let addedFeatures: string[] = [];

		function addFeature(feature: string, value: any) {
			hasAdd(feature, value);
			addedFeatures.push(feature);
		}

		return {
			afterEach() {
				document.documentElement.className = '';
				for (let feature of addedFeatures) {
					delete hasCache[feature];
				}
				addedFeatures = [];
			},

			'should add class for truthy features'() {
				addFeature('test-boolean', true);
				addFeature('test-number', 1);
				addFeature('test-string', 'yes');
				addFeature('test-lazy', function () {
					return true;
				});
				addFeature('test-not-here', true);

				dom.applyFeatureClass('test-boolean', 'test-number', 'test-string', 'test-lazy');
				assert.strictEqual(document.documentElement.className,
					'has-test-boolean has-test-number has-test-string has-test-lazy');
			},

			'should not add class for falsy features'() {
				addFeature('test-boolean', false);
				addFeature('test-number', 0);
				addFeature('test-string', '');
				addFeature('test-lazy', function () {
					return false;
				});

				dom.applyFeatureClass('test-boolean', 'test-number', 'test-string', 'test-lazy');
				assert.strictEqual(document.documentElement.className, '');
			},

			'should replace spaces with dashes for class names'() {
				// This would throw if we don't replace spaces,
				// due to underlying use of addClass which adheres to DOMTokenList#add conditions
				assert.doesNotThrow(function () {
					addFeature('test space', true);
				});
				dom.applyFeatureClass('test space');
				assert.strictEqual(document.documentElement.className, 'has-test-space');
			}
		};
	})(),

	byId: {
		setup() {
			element = document.createElement('span');
			element.id = 'id';
			document.body.appendChild(element);
		},

		teardown() {
			document.body.removeChild(element);
		},

		'result found'() {
			const result = dom.byId('id');
			assert.strictEqual(result && result.id, 'id');
		},

		'result not found'() {
			assert.isNull(dom.byId('undefined'));
		}
	},

	contains: (function () {
		function testContains(ancestor: Element, child: Node) {
			ancestor.appendChild(child);
			document.body.appendChild(ancestor);

			assert.isTrue(dom.contains(ancestor, child),
				'should return true when 2nd argument is a child of 1st argument');
			assert.isTrue(dom.contains(document.body, child),
				'should return true when 2nd argument is a grandchild of 1st argument');
			assert.isFalse(dom.contains(<any> child, ancestor),
				'should return false when 2nd argument is an ancestor of 1st argument');
		}

		return {
			beforeEach() {
				element = document.createElement('div');
			},

			afterEach() {
				if (element.parentNode) {
					element.parentNode.removeChild(element);
				}
			},

			'basic tests'() {
				testContains(element, document.createElement('div'));
			},

			'tests with text node'() {
				testContains(element, document.createTextNode(' '));
			},

			'inclusive descendant'() {
				assert.isTrue(dom.contains(element, element),
					'should return true if same node is passed for both arguments');
			},

			'null argument'() {
				assert.isFalse(dom.contains(element, <any> null),
					'should return false (and not error) if 2nd argument is null');
			}
		};
	})(),

	create: {
		'correct element created'() {
			let tagName = 'div';
			let result = dom.create(tagName);
			assert.strictEqual(result.tagName, tagName.toUpperCase());
		},

		'attributes and properties are set on element'() {
			let args: CreateArgs = { className: 'bar', attributes: { 'data-foo': 'test' } },
				element = dom.create('div', args);

			assert.strictEqual(element.className, 'bar');
			assert.strictEqual(element.getAttribute('data-foo'), 'test');
		},

		'string children are appended as Text nodes to element'() {
			let element = dom.create('div', <any> null, [ 'test1', 'test2' ]);
			assert.strictEqual(element.childNodes.length, 2);
			assert.strictEqual(element.firstChild.nodeName, '#text');
			assert.strictEqual(element.lastChild.nodeName, '#text');
		},

		'children are appended to element'() {
			let child1 = dom.create('div');
			let child2 = dom.create('div');
			let element = dom.create('div', <any> null, [ child1, child2 ]);

			assert.strictEqual(element.children.length, 2);
			assert.strictEqual(element.firstChild, child1);
			assert.strictEqual(element.lastChild, child2);
		},

		'children are added before properties are set'() {
			let selectArgs: CreateArgs = { value: 'bar' };

			const select = dom.create('select', selectArgs, [
				dom.create('option', { value: 'foo' }, [ 'foo' ]),
				dom.create('option', { value: 'bar' }, [ 'bar' ])
			]);
			assert.strictEqual(select.value, 'bar');
		},
		'created children that need to be created in a specific context'() {
			const result = dom.create('td');
			assert.strictEqual(result.outerHTML, '<td></td>');
		}
	},

	'CSS class manipulation': {
		setup() {
			element = document.createElement('div');
		},

		afterEach() {
			element.className = '';
		},

		addClass: {
			'add single class'() {
				assert.strictEqual(element.className, '');
				dom.addClass(element, 'test');
				assert.strictEqual(element.className, 'test');
			},

			'add multiple classes'() {
				dom.addClass(element, 'test1', 'test2');
				dom.addClass(element, 'test3');
				assert.strictEqual(element.className, 'test1 test2 test3');
			},

			'null node should not throw'() {
				assert.doesNotThrow(function () {
					dom.addClass(<any> null, 'test');
				});
			},

			'invalid class should throw'() {
				assert.throws(function () {
					dom.addClass(element, 'te est');
				});
				assert.throws(function () {
					dom.addClass(element, '');
				});
			},

			'null class should add "null" to className'() {
				assert.doesNotThrow(function () {
					dom.addClass(element, <any> null);
					assert.include(element.className, 'null');
				});
			},

			'no class should not throw'() {
				assert.doesNotThrow(function () {
					dom.addClass(element);
				});
			},

			'existing class should not get re-added'() {
				dom.addClass(element, 'test');
				dom.addClass(element, 'test');
				assert.lengthOf(element.className.match(/test/g), 1);
			}
		},

		containsClass: {
			'contains single class'() {
				dom.addClass(element, 'test');
				assert.isTrue(dom.containsClass(element, 'test'));
			},

			'null node should not throw'() {
				assert.doesNotThrow(function () {
					dom.containsClass(<any> null, 'test');
				});
			},

			'invalid class should throw'() {
				assert.throws(function () {
					dom.containsClass(element, 'te est');
				});
				assert.throws(function () {
					dom.containsClass(element, '');
				});
			},

			'null class should check for "null" CSS class'() {
				assert.doesNotThrow(function () {
					assert.isFalse(dom.containsClass(element, <any> null));
					dom.addClass(element, <any> null);
					assert.isTrue(dom.containsClass(element, <any> null));
				});
			},

			'should not match partial class names'() {
				dom.addClass(element, 'foobar');
				assert.isTrue(dom.containsClass(element, 'foobar'));
				assert.isFalse(dom.containsClass(element, 'foo'));
			}
		},

		removeClass: {
			'remove single class'() {
				dom.addClass(element, 'test');
				assert.include(element.className, 'test');
				dom.removeClass(element, 'test');
				assert.notInclude(element.className, 'test');
			},

			'remove multiple classes'() {
				element.className = 'test1 test2';
				assert.include(element.className, 'test1');
				assert.include(element.className, 'test2');
				dom.removeClass(element, 'test1', 'test2');
				assert.notInclude(element.className, 'test1');
				assert.notInclude(element.className, 'test2');
			},

			'null node should not throw'() {
				assert.doesNotThrow(function () {
					dom.removeClass(<any> null, 'test');
				});
			},

			'invalid class should throw'() {
				assert.throws(function () {
					dom.removeClass(element, 'te est');
				});
				assert.throws(function () {
					dom.removeClass(element, '');
				});
			},

			'null class should remove "null" from className'() {
				assert.doesNotThrow(function () {
					element.className = 'null';
					dom.removeClass(element, <any> null);
					assert.notInclude(element.className, 'null');
				});
			},

			'no class should not throw'() {
				assert.doesNotThrow(function () {
					dom.removeClass(element);
				});
			},

			'remove nonexistent class'() {
				dom.addClass(element, 'test');
				assert.doesNotThrow(function () {
					dom.removeClass(element, 'random');
				});
				assert.include(element.className, 'test');

				assert.doesNotThrow(function () {
					dom.removeClass(element, 'random', 'random1');
				});
			}
		},

		toggleClass: {
			'toggling existing class removes it'() {
				dom.addClass(element, 'test');
				assert.include(element.className, 'test');
				dom.toggleClass(element, 'test');
				assert.notInclude(element.className, 'test');
			},

			'toggling nonexistent class adds it'() {
				dom.toggleClass(element, 'test');
				assert.include(element.className, 'test');
			},

			'toggling class using force = true'() {
				dom.toggleClass(element, 'test', true);
				assert.include(element.className, 'test');
				dom.toggleClass(element, 'test', true);
				assert.include(element.className, 'test');
			},

			'toggling class using force = false'() {
				dom.toggleClass(element, 'test', false);
				assert.notInclude(element.className, 'test');
				dom.addClass(element, 'test');
				dom.toggleClass(element, 'test', false);
				assert.notInclude(element.className, 'test');
			},

			'null node should not throw'() {
				assert.doesNotThrow(function () {
					dom.toggleClass(<any> null, 'test');
				});
			},

			'invalid class should throw'() {
				assert.throws(function () {
					dom.toggleClass(element, 'te st');
				});
				assert.throws(function () {
					dom.toggleClass(element, '');
				});
			},

			'null class should toggle "null" on className'() {
				assert.doesNotThrow(function () {
					dom.toggleClass(element, <any> null);
					assert.include(element.className, 'null');
					dom.toggleClass(element, <any> null);
					assert.notInclude(element.className, 'null');
				});
			}
		}
	},

	fromString: (function () {
		const tags = [
			'caption',
			'col',
			'colgroup',
			'optgroup',
			'option',
			'rp',
			'rt',
			'rtc',
			'ruby',
			'tbody',
			'td',
			'tfoot',
			'th',
			'thead',
			'tr'
		];

		const selfClosingTags = [
			'source'
		];

		function createTagTest(tagName: string, selfClosing?: boolean) {
			return function () {
				// Single
				let html = '<' + tagName + '>' + (selfClosing ? '' : '</' + tagName + '>');
				let fragment = dom.fromString(html);
				assert.strictEqual(fragment.firstChild.nodeName, tagName.toUpperCase());

				// Multiple
				html += html;
				fragment = dom.fromString(html);
				assert.strictEqual(fragment.childNodes.length, 2);
				assert.strictEqual(fragment.firstChild.nodeName, tagName.toUpperCase());
				assert.strictEqual(fragment.lastChild.nodeName, tagName.toUpperCase());
			};
		}

		const tests: any = {
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
			}
		};

		for (let tag of tags) {
			tests['<' + tag + '> is created successfully and returned unwrapped'] = createTagTest(tag);
		}
		for (let tag of selfClosingTags) {
			tests['<' + tag + '> is created successfully and returned unwrapped'] = createTagTest(tag, true);
		}

		tests['no tag specified'] = function () {
			let text = 'test';
			let result = dom.fromString(text);
			assert.strictEqual(result.nodeName, '#document-fragment');
			assert.strictEqual(result.firstChild.nodeName, '#text');
			assert.strictEqual(result.firstChild.nodeValue, text);
		};

		return tests;
	})(),

	place: (function () {
		function createBeforeOrAfterTest(position: dom.Position) {
			const siblingProperty = position === dom.Position.Before ? 'previousSibling' : 'nextSibling';

			return function () {
				let node1 = document.createElement('div');
				let parent = document.createElement('div');
				let relativeElement = document.createElement('div');
				parent.appendChild(relativeElement);

				dom.place(node1, position, relativeElement);
				// TS7017
				assert.strictEqual((<any> relativeElement)[siblingProperty], node1);

				let node2 = document.createElement('div');
				dom.place(node2, position, relativeElement);
				// TS7017
				assert.strictEqual((<any> relativeElement)[siblingProperty], node2);
				assert.strictEqual((<any> node2)[siblingProperty], node1);
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
				let position: dom.Position;
				for (position of [ dom.Position.After, dom.Position.Before, dom.Position.Replace ]) {
					assert.throws(function () {
						dom.place(node, position, reference);
					}, ReferenceError);
				}
				for (position of [ dom.Position.FirstIn, dom.Position.LastIn ]) {
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
	}
});
