import { Handle } from 'dojo-core/interfaces';
import on, { ExtensionEvent } from 'dojo-core/on';
import has from './has';

const matchMethod = has('element-match');

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
export default function delegate(target: HTMLElement, selector: string, type: ExtensionEvent, listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: (string | ExtensionEvent)[], listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: any, listener: (event: UIEvent) => void): Handle {
	function matches(node: HTMLElement, selector: string) {
		// TS7017
		while (!(<any> node)[matchMethod](selector)) {
			if (!node.parentNode || !(<any> node.parentNode)[matchMethod]) {
				return null;
			}
			node = <HTMLElement> node.parentNode;
		}

		return node;
	}

	return on(<EventTarget> target, type, function(event: Event) {
		let existingId = target.getAttribute('id');
		let id = existingId || '__dojo__';

		if (!existingId) {
			target.setAttribute('id', id);
		} else {
			id = id.replace(/"/g, '\\$&');
		}

		let selectors = selector.split(',');
		for (let i = 0; i < selectors.length; i++) {
			selectors[i] = '[id="' + id + '"] ' + selectors[i];
		}
		let tempSelector = selectors.join(',');
		let matchedEventTarget = matches(<HTMLElement> event.target, tempSelector);

		try {
			if (matchedEventTarget) {
				return listener.call(matchedEventTarget, event);
			}
		} finally {
			if (!existingId) {
				target.removeAttribute('id');
			}
		}
	});
}
