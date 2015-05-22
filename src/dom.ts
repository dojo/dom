import has from 'dojo-core/has';
import { Handle } from 'dojo-core/interfaces';

// The stylesheet that addCssRule adds rules to
let extraSheet: CSSStyleSheet;

// Array used to keep track of added rule indexes, used when rules are removed
const ruleIndices: number[] = [];

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
 * Dynamically add a CSS rule to the document.
 *
 * @param selector a CSS selector
 * @param css a CSS rule string
 * @return an object that can be used to update and remove the rule
 *
 * @example
 * let handle = addCssRule('div.alert', 'background:red;color:white');
 */
export function addCssRule(selector: string, css: string): CssRuleHandle {
	if (!extraSheet) {
		const style = document.createElement('style');
		document.head.appendChild(style);
		extraSheet = <CSSStyleSheet> style.sheet;
	}
	const index = ruleIndices.length;
	ruleIndices[index] = extraSheet.cssRules.length;
	extraSheet.insertRule(`${selector}{${css}}`, ruleIndices[index]);
	return new CssRuleHandle(index);
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
	return Boolean(node.compareDocumentPosition(parent) & Node.DOCUMENT_POSITION_CONTAINS);
}

/**
 * A handle that can be used to update or remove a rule added by addCssRule.
 */
export class CssRuleHandle implements Handle {
	constructor(index: number) {
		Object.defineProperty(this, '_index', {
			configurable: true,
			value: index
		});
		Object.defineProperty(this, '_style', {
			configurable: true,
			value: (<CSSStyleRule> extraSheet.cssRules[ruleIndices[this._index]]).style
		});
	}

	protected _index: number;
	protected _style: CSSStyleDeclaration;

	/**
	 * Gets the value for a style property in this rule.
	 *
	 * @param property a CSS property name (e.g., 'font-size')
	 *
	 * @example
	 * let handle = addCssRule('.foo', 'font-size:8px');
	 * handle.get('font-size');  // '8px'
	 */
	get(property: string) {
		return this._style.getPropertyValue(property);
	}

	/**
	 * Sets the value of a style property in this rule.
	 *
	 * @param properties an object mapping property names to string values
	 * @param property a CSS property name (e.g., 'font-size')
	 * @param value a property value
	 *
	 * @example
	 * let handle = addCssRule('.foo', 'font-size:8px');
	 * handle.set('font-size', '10px');
	 * handle.set({ 'font-style', 'italic', 'text-decoration': 'underline' });
	 */
	set(properties: { [ property: string ]: string }): void;
	set(property: string, value: string): void;
	set(property: string | { [ name: string ]: string }, value?: string): void {
		if (typeof property === 'object') {
			for (const name in property) {
				this._style.setProperty(name, property[name]);
			}
		}
		else {
			this._style.setProperty(<string> property, value);
		}
	}

	/**
	 * Removes a style property from this rule.
	 *
	 * @param property a CSS property name (e.g., 'font-size')
	 *
	 * @example
	 * let handle = addCssRule('.foo', 'font-size:8px;font-style:italic;');
	 * handle.remove('font-size');
	 */
	remove(property: string) {
		this._style.removeProperty(property);
	}

	/**
	 * Removes this rule entirely.
	 *
	 * @example
	 * let handle = addCssRule('.foo', 'font-size:8px');
	 * handle.destroy();
	 */
	destroy() {
		// Remove the rule from the dynamic styesheet
		const ruleIndex = ruleIndices[this._index];
		extraSheet.deleteRule(ruleIndex);
		ruleIndices[this._index] = undefined;

		// Update all the rule indexes that were added after the one being removed to account for the removed rule.
		const numRules = ruleIndices.length;
		for (let i = this._index + 1; i < numRules; i++) {
			if (ruleIndices[i] > ruleIndex) {
				ruleIndices[i]--;
			}
		}

		// Delete the cached style
		Object.defineProperty(this, '_style', { configurable: false, value: undefined });
		Object.defineProperty(this, '_index', { configurable: false, value: undefined });

		// Disable this handle.
		this.destroy = function () {};
		this.get = function () { return null; };
		this.remove = function () {};
		this.set = function () {};
	}
}

// Tag trees for element creation, used by fromString
const tagWrap: {[key: string]: any} = {
	option: ['select'],
	tbody: ['table'],
	thead: ['table'],
	tfoot: ['table'],
	tr: ['table', 'tbody'],
	td: ['table', 'tbody', 'tr'],
	th: ['table', 'thead', 'tr'],
	caption: ['table'],
	colgroup: ['table'],
	col: ['table', 'colgroup']
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
export function fromString(html: string): DocumentFragment {
	html = String(html);

	const match = html.match(/<\s*([\w\:]+)/);
	const tag = match ? match[1].toLowerCase() : '';
	let master: HTMLElement = document.createElement('div');

	if (match && tagWrap[tag]) {
		let wrap = tagWrap[tag];
		master.innerHTML = wrap.pre + html + wrap.post;
		for (let i = wrap.length; i--;) {
			master = <HTMLElement> master.firstChild;
		}
	}
	else {
		master.innerHTML = html;
	}

	let fragment = document.createDocumentFragment();
	let firstChild: Node;
	while ((firstChild = master.firstChild)) {
		fragment.appendChild(firstChild);
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
