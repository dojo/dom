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

for(let param in tagWrap){
    let tw = tagWrap[param];
    tw.pre = param == 'option' ? '<select multiple="multiple">' : '<' + tw.join('><') + '>';
    tw.post = '</' + tw.reverse().join('></') + '>';
}

function insertAfter(node: Node, relativeElement: Node) {
	let parent: Node = relativeElement.parentNode;
	if (!parent) { return; }
	if (parent.lastChild == relativeElement) {
		parent.appendChild(node);
	} else {
		parent.insertBefore(node, relativeElement.nextSibling);
	}
}

/**
 * Places a node in the DOM relative to another node
 *
 * @param node The node to place in the DOM
 * @param position The position to place the node, relative to relativeElement
 * @param relativeElement The node to use as a reference when placing
 *
 * @example
 * dom.place(node, anotherNode, dom.Position.After);
 */
export function place<T extends Node>(node: T, position: Position, relativeElement: Element): void {
	let parent: Node = relativeElement.parentNode;

	if (!parent) {
		throw new Error('Reference node must be in DOM');
	}

	switch (position) {
		case Position.Before:
			parent.insertBefore(node, relativeElement);
			break;
		case Position.After:
			insertAfter(node, relativeElement);
			break;
		case Position.Replace:
			parent.replaceChild(node, relativeElement);
			break;
		case Position.FirstIn:
			if (relativeElement.firstChild) {
                relativeElement.insertBefore(node, relativeElement.firstChild);
				break;
			}
		// case Position.LastIn:
		default:
			relativeElement.appendChild(node);
			break;
	}
}

/**
 * Retrieves an element by its ID attribute
 *
 * @param id ID to match in the DOM
 * @returns the element with a matching ID attribute if found, otherwise null
 *
 * @example
 * var element = byId('anElement');
 */
export function byId(id: string): HTMLElement {
	return document.getElementById(id);
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
export function fromString<T extends Node>(html: string): DocumentFragment {
    html = String(html);

    let match = html.match(/<\s*([\w\:]+)/);
    let tag = match ? match[1].toLowerCase() : '';
    let master = document.createElement('div');
    let outer: Node;

    if(match && tagWrap[tag]){
    	let wrap = tagWrap[tag];
    	master.innerHTML = wrap.pre + html + wrap.post;
    	for(let i = wrap.length; i; --i){
            outer = master.firstChild;
    	}
    }else{
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
