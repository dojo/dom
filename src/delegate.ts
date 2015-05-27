import { Handle } from 'dojo-core/interfaces';
import on, { ExtensionEvent } from 'dojo-core/on';
import has from './has';

export default function delegate(target: HTMLElement, selector: string, type: string, listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: ExtensionEvent, listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: (string | ExtensionEvent)[], listener: (event: UIEvent) => void): Handle;
export default function delegate(target: HTMLElement, selector: string, type: any, listener: (event: UIEvent) => void): Handle {
	function matches(target: HTMLElement) {
		let node = target;
		let matchMethod = has('element-match');

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
		let matchedEventTarget = matches(<HTMLElement> event.target);
		if (matchedEventTarget) {
			return listener.call(matchedEventTarget, event);
		}
	});
}
