/**
 * Retrieves an element by its ID attribute
 *
 * @example
 * var element = byId('anElement');
 */
export function byId(id: string): HTMLElement {
	return global.getElementById(id);
}
