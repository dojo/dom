import { Handle } from 'dojo-core/interfaces';

// The stylesheet that addCssRule adds rules to
let extraSheet: CSSStyleSheet;

// Array used to keep track of added rule indexes, used when rules are removed
const ruleIndices: (number | undefined)[] = [];

/**
 * A handle that can be used to update or remove a rule added by addCssRule.
 */
export interface CssRuleHandle extends Handle {
	get(property: string): string;
	remove(property: string): void;
	set(property: string, value: string): void;
	set(properties: { [property: string]: string }): void;
}

function destroyedFunc(): any {
	return null;
}

// The implementation is embedded in an internal namespace to allow it to use the same name as the interface.
// Only the interface is exposed externally.
namespace Impl {
	export class CssRuleHandle implements CssRuleHandle {
		constructor(index: number) {
			Object.defineProperty(this, '_index', {
				configurable: true,
				value: index
			});
			Object.defineProperty(this, '_style', {
				configurable: true,
				value: (<CSSStyleRule> extraSheet.cssRules[<number> ruleIndices[this._index]]).style
			});
		}

		protected _index: number;
		protected _style: CSSStyleDeclaration;

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

			// NOTE: This is intentionally not a splice, since the purpose of this array is
			// specifically to negotiate the splicing that occurs in the stylesheet itself
			ruleIndices[this._index] = undefined;

			// Update all the rule indices that were added after the one being removed to account for the removed rule.
			const numRules = ruleIndices.length;
			for (let i = this._index + 1; i < numRules; i++) {
				if (ruleIndices[i] > ruleIndex) {
					ruleIndices[i]--;
				}
			}

			// Delete the cached style
			Object.defineProperty(this, '_style', { configurable: false, value: undefined });
			Object.defineProperty(this, '_index', { configurable: false, value: undefined });

			// Disable all functions on this handle to avoid errors from future calls
			this.destroy = this.get = this.remove = this.set = destroyedFunc;
		}

		/**
		 * Gets the value for a style property in this rule.
		 *
		 * @param property A CSS property name (e.g. 'font-size')
		 *
		 * @example
		 * let handle = addCssRule('.foo', 'font-size:8px');
		 * handle.get('font-size');  // '8px'
		 */
		get(property: string) {
			return this._style.getPropertyValue(property);
		}

		/**
		 * Removes a style property from this rule.
		 *
		 * @param property A CSS property name (e.g. 'font-size')
		 *
		 * @example
		 * let handle = addCssRule('.foo', 'font-size:8px;font-style:italic;');
		 * handle.remove('font-size');
		 */
		remove(property: string) {
			this._style.removeProperty(property);
		}

		/**
		 * Sets the value of a style property in this rule.
		 *
		 * @param property A CSS property name (e.g., 'font-size') or an object mapping property names to string values
		 * @param value A property value (only used when property is a single property name)
		 *
		 * @example
		 * let handle = addCssRule('.foo', 'font-size:8px');
		 * handle.set('font-size', '10px');
		 * handle.set({ 'font-style', 'italic', 'text-decoration': 'underline' });
		 */
		set(property: { [property: string]: string }): void;
		set(property: string, value: string): void;
		set(property: string | { [ name: string ]: string }, value?: string): void {
			if (typeof property === 'object') {
				for (const name in property) {
					this._style.setProperty(name, property[name]);
				}
			}
			else if (value) {
				this._style.setProperty(<string> property, value);
			}
		}
	}
}

/**
 * Dynamically adds a CSS rule to the document.
 *
 * @param selector a CSS selector
 * @param css a CSS rule string
 * @return an object that can be used to update and remove the rule
 *
 * @example
 * let handle = addCssRule('div.alert', 'background: red; color: white;');
 */
export default function addCssRule(selector: string, css: string): CssRuleHandle {
	if (!extraSheet) {
		const style = document.createElement('style');
		document.head.appendChild(style);
		extraSheet = <CSSStyleSheet> style.sheet;
	}
	const index = ruleIndices.length;
	ruleIndices[index] = extraSheet.cssRules.length;
	extraSheet.insertRule(`${selector}{${css}}`, ruleIndices[index]);

	return new Impl.CssRuleHandle(index);
}
