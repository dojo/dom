// Positions used for node placement
export enum Position {
	LastIn,
	FirstIn,
	After,
	Before,
	Replace
}

// Tag trees for element creation
let tagWrap: {[key: string]: any} = {
	option: ['select'],
	tbody: ['table'],
	thead: ['table'],
	tfoot: ['table'],
	tr: ['table', 'tbody'],
	td: ['table', 'tbody', 'tr'],
	th: ['table', 'thead', 'tr'],
	legend: ['fieldset'],
	caption: ['table'],
	colgroup: ['table'],
	col: ['table', 'colgroup'],
	li: ['ul']
};

for (let param in tagWrap) {
	let tw = tagWrap[param];
	tw.pre = param === 'option' ? '<select multiple="multiple">' : '<' + tw.join('><') + '>';
	tw.post = '</' + tw.reverse().join('></') + '>';
}

function insertAfter(node: Node, relativeElement: Node) {
	let parent: Node = relativeElement.parentNode;
	if (!parent) {
		return;
	}
	if (parent.lastChild === relativeElement) {
		parent.appendChild(node);
	}
	else {
		parent.insertBefore(node, relativeElement.nextSibling);
	}
}

function validateClass(token: string): void {
	if (token === '') {
		throw new Error('An invalid or illegal string was specified');
	}
	if (/\s/.test(token)) {
		throw new Error('String contains an invalid character');
	}
}

/**
 * Adds one or more CSS class names to an Element without duplication
 *
 * @param element The Element to which to add CSS classes
 * @param classes An array of string CSS classes to add to the Element
 *
 * @example
 * dom.addClass(document.body, 'loaded');
 *
 * @example
 * dom.addClass(document.body, 'loaded', 'ready');
 */
export function addClass(element: Element, ...classes: string[]): void {
	let targetElement = <any> element;
	if (targetElement.classList) {
		let classList: any = targetElement.classList;
		targetElement.classList.add.apply(null, classes);
	}
	else {
		let newClasses: string[] = new Array();
		for (let className in classes) {
			validateClass(className);
			if (!this.contains(targetElement, className)) {
				newClasses.push(className);
			}
		}
		if (newClasses.length > 0) {
			targetElement.className += (' ' + newClasses.join(' '));
		}
	}
}


/**
 * Retrieves an element by its ID attribute
 *
 * @param id ID to match in the DOM
 * @returns the element with a matching ID attribute if found, otherwise null
 *
 * @example
 * var element = dom.byId('anElement');
 */
export function byId(id: string): HTMLElement {
	return document.getElementById(id);
}

/**
 * Determines whether an ELement has a CSS class name
 *
 * @param element The Element to which to check for a CSS class
 * @param className The CSS class name to check for
 *
 * @example
 * var loaded = dom.containsClass(document.body, 'loaded');
 */
export function containsClass(element: Element, className: string): boolean {
	let targetElement = <any> element;
	if (targetElement.classList) {
		let classList: any = targetElement.classList;
		return classList.contains(className);
	}
	else {
		validateClass(className);
		return targetElement.className.indexOf(className) > -1;
	}
}

/**
 * Creates a DocumentFragment from a string
 *
 * @param html string representation of nodes to create
 * @returns DocumentFragment containing childNodes based on html string
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

	let match = html.match(/<\s*([\w\:]+)/);
	let tag = match ? match[1].toLowerCase() : '';
	let master = document.createElement('div');
	let outer: Node;

	if (match && tagWrap[tag]) {
		let wrap = tagWrap[tag];
		master.innerHTML = wrap.pre + html + wrap.post;
		for (let i = wrap.length; i; --i) {
			outer = master.firstChild;
		}
	}
	else {
		master.innerHTML = html;
		outer = master;
	}

	let fragment = document.createDocumentFragment();
	let firstChild: Node;
	while ((firstChild = master.firstChild)) {
		fragment.appendChild(firstChild);
	}
	return fragment;
}

/**
 * Places a node in the DOM relative to another node
 *
 * @param node The node to place in the DOM
 * @param position The position to place the node, relative to relativeElement
 * @param relativeElement The node to use as a reference when placing
 *
 * @example
 * dom.place(node, dom.Position.After, anotherNode);
 */
export function place(node: Node, position: Position, relativeElement: Element): void {
	let parent: Node = relativeElement.parentNode;

	if (!parent) {
		throw new Error('Reference node must be in DOM');
	}

	if (position === Position.Before) {
		parent.insertBefore(node, relativeElement);
	}
	else if (position === Position.After) {
		insertAfter(node, relativeElement);
	}
	else if (position === Position.Replace) {
		parent.replaceChild(node, relativeElement);
	}
	else if (position === Position.FirstIn && relativeElement.firstChild) {
		relativeElement.insertBefore(node, relativeElement.firstChild);
	}
	// Position.LastIn:
	else {
		relativeElement.appendChild(node);
	}
}

/**
 * Removes all instances of one ore more CSS class names from an Element
 *
 * @param element The Element from which to remove CSS classes
 * @param classes An array of string CSS classes to remove from the Element
 *
 * @example
 * dom.removeClass(document.body, 'loading');
 *
 * @example
 * dom.removeClas(document.body, 'loading', 'pending');
 */
export function removeClass(element: Element, ...classes: string[]): void {
	let targetElement = <any> element;
	if (targetElement.classList) {
		let classList: any = targetElement.classList;
		targetElement.classList.remove.apply(null, classes);
	}
	else {
		let oldClasses: string[] = targetElement.className.split(/\s+/);
		let length = oldClasses.length;
		for (let className in classes) {
			validateClass(className);
			
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
}

/**
 * Toggles the presence of a CSS class name on an Element. An optional
 * second parameter can be used to force class addition or removal.
 *
 * @param element The Element to add or remove classes to or from
 * @param className The CSS class name add or remove
 * @param force Forces either class addition if true or class removal if flase
 *
 * @example
 * dom.removeClass(document.body, 'loading');
 *
 * @example
 * dom.removeClas(document.body, 'loading', 'pending');
 */
export function toggleClass(element: Element, className: string, force?: boolean): boolean {
	let targetElement = <any> element;
	if (targetElement.classList) {
		let classList: any = targetElement.classList;
		return targetElement.classList.toggle.apply(null, className, force);
	}
	else {
		let contains = this.contains(element, className);
		this[contains ? 'removeClass' : 'addClass'](element, className);

		if (force != undefined) {
			return force;
		}
		return !contains;
	}
}
