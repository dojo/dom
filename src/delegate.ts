import { Handle } from 'dojo-interfaces/core';
import on from 'dojo-core/on';
import has from './has';

const matchesMethod = has('dom-element-matches') as string;

/**
 * Provides a normalized mechanism for using a single event handler to listen
 * to delegated events from DOM nodes.
 *
 * @param target The Element to which to attach a single event handler
 * @param selector A CSS selector used to determine whether the event handler is called
 * @param type Event type(s) to listen for; may be strings or extension events
 * @param listener Callback to handle the event when it fires
 * @return A handle which will remove the listener when destroy is called
 *
 * @example
 * dom.delegate(document.body, 'li', 'click', function () {
 *     // ...
 * });
 *
 * @example
 * dom.delegate(document.body, 'li', ['click', 'mouseover'], function () {
 *     // ...
 * });
 */
export default function delegate(target: HTMLElement, selector: string, type: string, listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: string[], listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: any, listener: (event: UIEvent) => void): Handle {
	function matches(element: HTMLElement, selector: string) {
		// Search in ancestors of the given element as well,
		// since the event could have bubbled into an element matching the selector.
		// Once the target is reached, stop searching up the ancestor chain (for performance).

		// TS7017
		while (!(<any> element)[matchesMethod](selector)) {
			if (element === target || !element.parentNode || !(<any> element.parentNode)[matchesMethod]) {
				return null;
			}
			element = <HTMLElement> element.parentNode;
		}

		return element;
	}

	return on(target, type, function(event: Event) {
		// Add an ID to the selector used for matching, to avoid unwanted matches due to elements outside the root
		// (Adapted from code in Dojo 1, which itself was adapted from a strategy employed by Sizzle)
		const existingId = target.getAttribute('id');
		let id = existingId || '__dojo__';

		if (!existingId) {
			target.setAttribute('id', id);
		} else {
			id = id.replace(/"/g, '\\"');
		}

		let selectors = selector.split(/\s*,\s*/);
		for (let i = 0; i < selectors.length; i++) {
			selectors[i] = '[id="' + id + '"] ' + selectors[i];
		}

		let eventTarget = <Node> event.target;
		if (eventTarget.nodeType !== 1) {
			// Text nodes don't have .matches; other node types generally aren't applicable
			eventTarget = eventTarget.parentNode;
		}
		let matchedEventTarget: HTMLElement | null = null;

		try {
			matchedEventTarget = matches(<HTMLElement> eventTarget, selectors.join(','));
		}
		catch (error) {
			// Nothing needs to be done here, but this block is needed to suppress console errors
		}
		finally {
			if (!existingId) {
				target.removeAttribute('id');
			}
		}

		if (matchedEventTarget) {
			return listener.call(matchedEventTarget, event);
		}
	});
}
