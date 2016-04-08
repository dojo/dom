import has from './has';
import { CreateArgs, CreateFunction } from './interfaces';

/**
 * Validates a token for the CSS class manipulation methods.
 */
function validateToken(token: string): void {
	if (token === '') {
		throw new Error('An invalid or illegal string was specified');
	}
	if (/\s/.test(token)) {
		throw new Error('String contains an invalid character');
	}
}

/**
 * Adds one or more CSS class names to an HTMLElement, without duplication.
 *
 * @param element The Element to which to add CSS classes
 * @param classes One or more CSS class strings to add to the Element
 *
 * @example
 * dom.addClass(document.body, 'loaded');
 *
 * @example
 * dom.addClass(document.body, 'loaded', 'ready');
 */
export function addClass(element: HTMLElement, ...classes: string[]): void {
	// Cast to <any> to support multiple Element types. For more info,
	// see https://github.com/Microsoft/TypeScript/issues/3220
	let targetElement = <any> element;
	if (!targetElement || !classes.length) {
		return;
	}
	let newClasses: string[] = [];
	for (let className of classes) {
		validateToken(className);
		if (!containsClass(targetElement, className)) {
			// Convert to string to match native classList implementations for values like null
			newClasses.push(String(className));
		}
	}
	if (newClasses.length) {
		targetElement.className += (targetElement.className.length ? ' ' : '') + newClasses.join(' ');
	}
}

/**
 * Applies CSS classes to the root element if the specified has features have truthy values.
 *
 * @param features One or more features to test and potentially apply CSS classes based on
 */
export function applyFeatureClass(...features: string[]) {
	// args will be applied to addClass, so start with the element classes will be added to
	let args: any[] = [ document.documentElement ];
	for (let feature of features) {
		if (has(feature)) {
			args.push('has-' + feature.replace(/\s/g, '-'));
		}
	}
	addClass.apply(null, args);
}

/**
 * Retrieves an element from the document by its ID attribute.
 *
 * @param id ID to match in the DOM
 * @return the element with a matching ID attribute if found, otherwise null
 *
 * @example
 * var element = dom.byId('anElement');
 */
export function byId(id: string): HTMLElement {
	return document.getElementById(id);
}

/**
 * Indicates whether the given parent contains the given node.
 * @param parent The parent node to check within
 * @param node The node to test whether parent is its ancestor
 * @return `true` if parent contains node, `false` otherwise
 */
export function contains(parent: Element, node: Node): boolean {
	// While modern browsers do support parent.contains, some support it only on HTML elements,
	// and IE has a known bug involving passing a text node as the argument:
	// https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
	// Meanwhile, compareDocumentPosition works in all supported browsers.

	if (node == null) {
		return false;
	}
	if (parent === node) {
		return true;
	}
	return Boolean(node.compareDocumentPosition(parent) & Node.DOCUMENT_POSITION_CONTAINS);
}

/*
 * Creates an Element.
 *
 * @param tagName Type of Element to create
 * @param kwArgs An object containing properties to add to the Element.
 *               If an "attributes" property is present, each member of this sub-object will be added to the Element
 *               via element.setAttribute
 * @param children An array of Nodes or strings, the latter of which will be converted to Text nodes
 * @return The created Element, with any passed properties/attributes applied
 *
 * @example
 * var div = dom.create('div', { className: 'loaded', attributes: { 'data-index': '1' } });
 *
 * @example
 * var div = dom.create('ul', null, [ dom.create('li'), dom.create('li') ]);
 *
 * @example
 * var div = dom.create('div', null, [ 'hello', ' ', 'world' ]);
 */

export let create: CreateFunction = function (
		tagName: string, kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement {
	var element = document.createElement(tagName);
	if (children) {
		for (let child of children) {
			if (typeof child === 'string') {
				child = document.createTextNode(<string> child);
			}
			element.appendChild(<Node> child);
		}
	}
	if (kwArgs) {
		for (let property in kwArgs) {
			if (property === 'attributes') {
				for (let attribute in kwArgs.attributes) {
					element.setAttribute(attribute, kwArgs.attributes[attribute]);
				}
			}
			else {
				(<any> element)[property] = kwArgs[property];
			}
		}
	}
	return element;
};

// Tag trees for element creation, used by fromString
const tagWrap: {[key: string]: any} = {
	caption: [ 'table' ],
	col: [ 'table', 'colgroup' ],
	colgroup: [ 'table' ],
	optgroup: [ 'select' ],
	option: [ 'select' ],
	rp: [ 'ruby' ],
	rt: [ 'ruby' ],
	rtc: [ 'ruby' ],
	source: [ 'audio' ],
	tbody: [ 'table' ],
	td: [ 'table', 'tbody', 'tr' ],
	tfoot: [ 'table' ],
	th: [ 'table', 'thead', 'tr' ],
	thead: [ 'table' ],
	tr: [ 'table', 'tbody' ]
};

for (const param in tagWrap) {
	const tw = tagWrap[param];
	tw.pre = param === 'option' ? '<select multiple="multiple">' : '<' + tw.join('><') + '>';
	tw.post = '</' + tw.reverse().join('></') + '>';
}

/**
 * Determines whether an HTMLElement has a given CSS class name.
 *
 * @param element The Element to check for a CSS class
 * @param className The CSS class name to check for
 *
 * @example
 * var hasLoaded = dom.containsClass(document.body, 'loaded');
 */
export function containsClass(element: HTMLElement, className: string): boolean {
	let targetElement = <any> element;
	if (!targetElement) {
		return;
	}
	validateToken(className);
	let targetClass = ' ' + targetElement.className + ' ';
	return targetClass.indexOf(' ' + className + ' ') > -1;
}

/**
 * Creates a DocumentFragment from a string.
 *
 * @param html string representation of nodes to create
 * @return DocumentFragment containing childNodes based on html string
 *
 * @example
 * var fragment = dom.fromString('<div></div>');
 *
 * @example
 * var fragment = dom.fromString('<div></div><span></span>');
 *
 * @example
 * var fragment = dom.fromString('<tr>');
 */
export function fromString(html: string): DocumentFragment  {
	let fragment: DocumentFragment;
	const useContextualFragment = has('dom-contextual-fragment');

	let master: HTMLElement = document.createElement('div');
	const match = String(html).match(/<\s*([\w\:]+)/);
	const tag = match ? match[1].toLowerCase() : '';

	function unwrapElement(element: HTMLElement, levels: number): HTMLElement {
		for (let i = 0; i < levels; i++) {
			element = <HTMLElement> element.firstChild;
		}

		return element;
	}

	if (useContextualFragment) {
		master.style.display = 'none';
		document.body.appendChild(master);
		const range = document.createRange();
		range.selectNode(master);

		if (match && tagWrap[tag]) {
			const wrap = tagWrap[tag];
			const wrappedHTML = wrap.pre + html + wrap.post;
			fragment = range.createContextualFragment(wrappedHTML);
			fragment = unwrapElement(<HTMLElement> fragment, wrap.length);
		}
		else {
			fragment = range.createContextualFragment(html);
		}
	}
	else {
		if (match && tagWrap[tag]) {
			const wrap = tagWrap[tag];
			const wrappedHTML = wrap.pre + html + wrap.post;
			master.innerHTML = wrappedHTML;
			master = unwrapElement(master, wrap.length);
		}
		else {
			master.innerHTML = html;
		}

		fragment = document.createDocumentFragment();
		let firstChild: Node;
		while (firstChild = master.firstChild) {
			fragment.appendChild(firstChild);
		}
	}

	return fragment;
}

/*
 * Positions used with the place API for node placement.
 */
export enum Position {
	After,
	Before,
	FirstIn,
	LastIn,
	Replace
}

/**
 * Places a node in the DOM relative to another node.
 *
 * @param node The node to place in the DOM
 * @param position The position to place the node, relative to relativeElement
 * @param relativeElement The node to use as a reference when placing
 *
 * @example
 * dom.place(node, dom.Position.After, anotherNode);
 */
export function place(node: Node, position: Position, relativeElement: Element): void {
	let parent: Node;

	if (position === Position.After || position === Position.Before || position === Position.Replace) {
		parent = relativeElement.parentNode;
		if (!parent) {
			throw new ReferenceError('dom.place: Reference node must have a parent to determine placement');
		}
	}

	if (position === Position.After) {
		if (parent.lastChild === relativeElement) {
			parent.appendChild(node);
		}
		else {
			parent.insertBefore(node, relativeElement.nextSibling);
		}
	}
	else if (position === Position.Before) {
		parent.insertBefore(node, relativeElement);
	}
	else if (position === Position.Replace) {
		parent.replaceChild(node, relativeElement);
	}
	else if (position === Position.FirstIn) {
		relativeElement.insertBefore(node, relativeElement.firstChild);
	}
	else {
		// LastIn
		relativeElement.appendChild(node);
	}
}

/**
 * Removes a node from the DOM.
 *
 * @param node The node to remove
 */
export function remove(node: Node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * Removes all instances of one ore more CSS class names from an HTMLElement.
 *
 * @param element The Element from which to remove CSS classes
 * @param classes An array of string CSS classes to remove from the Element
 *
 * @example
 * dom.removeClass(document.body, 'loading');
 *
 * @example
 * dom.removeClass(document.body, 'loading', 'pending');
 */
export function removeClass(element: HTMLElement, ...classes: string[]): void {
	let targetElement = <any> element;
	if (!targetElement) {
		return;
	}
	let oldClasses: string[] = targetElement.className.split(/\s+/);
	let length = oldClasses.length;
	for (let className of classes) {
		className = String(className);
		validateToken(className);
		let index = oldClasses.indexOf(className);
		while (index !== -1) {
			oldClasses.splice(index, 1);
			index = oldClasses.indexOf(className);
		}
	}
	if (oldClasses.length < length) {
		targetElement.className = oldClasses.join(' ');
	}
}

/**
 * Toggles the presence of a CSS class name on an HTMLElement. An optional
 * second parameter can be used to force class addition or removal.
 *
 * @param element The Element to add or remove classes to or from
 * @param className The CSS class name add or remove
 * @param force Forces either class addition if true or class removal if false
 *
 * @example
 * dom.toggleClass(button, 'active');
 *
 * @example
 * dom.toggleClass(button, 'active', isActive);
 */
export function toggleClass(element: HTMLElement, className: string, force: boolean = !containsClass(element, className)): boolean {
	const func = force ? addClass : removeClass;
	func(element, className);
	return force;
}
