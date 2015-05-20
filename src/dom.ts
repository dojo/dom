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
