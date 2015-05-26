import { Handle } from 'dojo-core/interfaces';
import on, { ExtensionEvent } from 'dojo-core/on';

export default function delegate(target: HTMLElement, selector: string, type: string, listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: ExtensionEvent, listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: (string | ExtensionEvent)[], listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: any, listener: (event: UIEvent) => void): Handle {
	function matches(target: EventTarget) {
		let node = <any> target;
		let matchMethod = (function() {
			if (typeof node.matches === 'function') {
				return 'matches';
			}
			if (typeof node.webkitMatchesSelector === 'function') {
				return 'webkitMatchesSelector';
			}
			if (typeof node.msMatchesSelector === 'function') {
				return 'msMatchesSelector';
			}
		})();

		while (!node[matchMethod](selector)) {
			if (!node.parentNode || !node.parentNode[matchMethod]) {
				return false;
			}
			node = node.parentNode;
		}

		return node;
	}

	return on(<EventTarget> target, type, function (event: Event) {
		let matchedEventTarget = matches(event.target);
		if (matchedEventTarget) {
			return listener.call(matchedEventTarget, event);
		}
	}, false);
}
