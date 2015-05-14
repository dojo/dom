export enum Position {
    LastIn,
    FirstIn,
    After,
    Before,
    Replace
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
 * @param id to match in the DOM
 * @returns the element with a matching ID attribute if found, otherwise null
 *
 * @example
 * var element = byId('anElement');
 */
export function byId(id: string): HTMLElement {
	return document.getElementById(id);
}
