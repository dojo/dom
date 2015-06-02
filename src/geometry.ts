/**
 * Given a CSS px value (e.g. '10px'), strips the px suffix and returns the value as a number.
 */
function pxToNumber(value: string): number {
	return Number(value.slice(0, -2));
}

/**
 * Given a number, returns a CSS px value (e.g. '10px')
 */
function numberToPx(value: number): string {
	return value + 'px';
}

/**
 * Returns an object satisfying the ClientRect interface that is the result of adjusting the given ClientRect
 * by the given dimensions.  The resulting object will have larger dimensions if the adjustment parameters
 * are positive, or smaller dimensions if they are negative.
 */
function adjustBox(box: ClientRect, top: number, right: number, bottom: number, left: number): ClientRect {
	return {
		bottom: box.bottom + bottom,
		height: box.height + top + bottom,
		left: box.left - left,
		right: box.right + right,
		top: box.top - top,
		width: box.width + left + right
	};
}

export interface SettableClientRect {
    height?: number;
    left?: number;
    top?: number;
    width?: number;
}

/**
 * Returns an object with information on the dimensions of an Element's border box.
 * @param element The Element to measure
 * @return An object reporting the top, right, bottom, left, width, and height of the Element's border box
 */
export function getBorderBox(element: Element): ClientRect {
	// Return a plain/mutable object (not a native read-only ClientRect) to be consistent with the other functions.
	// We may end up modifying these values anyway (for scroll adjustment).
	return adjustBox(element.getBoundingClientRect(), 0, 0, 0, 0);
}

/**
 * Returns an object with information on the dimensions of an Element's content box.
 * @param element The Element to measure
 * @return An object reporting the top, right, bottom, left, width, and height of the Element's content box
 */
export function getContentBox(element: Element): ClientRect {
	// While this could reuse getPaddingBox, it does not, to avoid an extra getComputedStyle call.
	const style = getComputedStyle(element);
	return adjustBox(getBorderBox(element),
		-pxToNumber(style.borderTopWidth) - pxToNumber(style.paddingTop),
		-pxToNumber(style.borderRightWidth) - pxToNumber(style.paddingRight),
		-pxToNumber(style.borderBottomWidth) - pxToNumber(style.paddingBottom),
		-pxToNumber(style.borderLeftWidth) - pxToNumber(style.paddingLeft)
	);
}

/**
 * Returns an object with information on the dimensions of an Element's margin box.
 * @param element The Element to measure
 * @return An object reporting the top, right, bottom, left, width, and height of the Element's margin box
 */
export function getMarginBox(element: Element): ClientRect {
	const style = getComputedStyle(element);
	return adjustBox(getBorderBox(element),
		pxToNumber(style.marginTop),
		pxToNumber(style.marginRight),
		pxToNumber(style.marginBottom),
		pxToNumber(style.marginLeft)
	);
}

/**
 * Returns an object with information on the dimensions of an Element's padding box.
 * @param element The Element to measure
 * @return An object reporting the top, right, bottom, left, width, and height of the Element's padding box
 */
export function getPaddingBox(element: Element): ClientRect {
	const style = getComputedStyle(element);
	return adjustBox(getBorderBox(element),
		-pxToNumber(style.borderTopWidth),
		-pxToNumber(style.borderRightWidth),
		-pxToNumber(style.borderBottomWidth),
		-pxToNumber(style.borderLeftWidth)
	);
}

/**
 * Sets the dimensions of an Element's border box.
 * @param element The Element to modify
 * @param rect An object containing optional number properties for height, left, top, and width
 */
export function setBorderBox(element: HTMLElement, rect: SettableClientRect): void {
	const style = getComputedStyle(element);
	const borderBox = style.boxSizing && style.boxSizing === 'border-box';

	if (rect.height) {
		let height = 0;
		if (borderBox) {
			height = rect.height;
		}
		else {
			height = rect.height
				- pxToNumber(style.paddingTop)
				- pxToNumber(style.paddingBottom)
				- pxToNumber(style.borderTopWidth)
				- pxToNumber(style.borderBottomWidth);
		}
		element.style.height = numberToPx(height);
	}

	if (rect.width) {
		let width = 0;
		if (borderBox) {
			width = rect.width;
		}
		else {
			width = rect.width
				- pxToNumber(style.paddingLeft)
				- pxToNumber(style.paddingRight)
				- pxToNumber(style.borderLeftWidth)
				- pxToNumber(style.borderRightWidth);
		}
		element.style.width = numberToPx(width);
	}

	if (rect.top) {
		element.style.top = numberToPx(rect.top - pxToNumber(style.marginTop));
	}

	if (rect.left) {
		element.style.left = numberToPx(rect.left - pxToNumber(style.marginLeft));
	}
}

/**
 * Sets the dimensions of an Element's content box.
 * @param element The Element to modify
 * @param rect An object containing optional number properties for height, left, top, and width
 */
export function setContentBox(element: HTMLElement, rect: SettableClientRect): void {
	const style = getComputedStyle(element);
	const borderBox = style.boxSizing && style.boxSizing === 'border-box';

	if (rect.height) {
		let height = 0;
		if (borderBox) {
			height = rect.height
			+ pxToNumber(style.paddingTop)
			+ pxToNumber(style.paddingBottom)
			+ pxToNumber(style.borderTopWidth)
			+ pxToNumber(style.borderBottomWidth);
			
		}
		else {
			height = rect.height;
		}
		element.style.height = numberToPx(height);
	}

	if (rect.width) {
		let width = 0;
		if (borderBox) {
			width = rect.width
			+ pxToNumber(style.paddingLeft)
			+ pxToNumber(style.paddingRight)
			+ pxToNumber(style.borderLeftWidth)
			+ pxToNumber(style.borderRightWidth);
		}
		else {
			width = rect.width;
		}
		element.style.width = numberToPx(width);
	}

	if (rect.top) {
		element.style.top = numberToPx(rect.top
			- pxToNumber(style.marginTop)
			- pxToNumber(style.borderTopWidth)
			- pxToNumber(style.paddingTop));
	}

	if (rect.left) {
		element.style.left = numberToPx(rect.left
			- pxToNumber(style.marginLeft)
			- pxToNumber(style.borderLeftWidth)
			- pxToNumber(style.paddingLeft));
	}
}

/**
 * Sets the dimensions of an Element's margin box.
 * @param element The Element to modify
 * @param rect An object containing optional number properties for height, left, top, and width
 */
export function setMarginBox(element: HTMLElement, rect: SettableClientRect): void {
	const style = getComputedStyle(element);
	const borderBox = style.boxSizing && style.boxSizing === 'border-box';

	if (rect.height) {
		let height = 0;
		if (borderBox) {
			height = rect.height
				- pxToNumber(style.marginTop)
				- pxToNumber(style.marginBottom);
		}
		else {
			height = rect.height
				- pxToNumber(style.marginTop)
				- pxToNumber(style.marginBottom)
				- pxToNumber(style.paddingTop)
				- pxToNumber(style.paddingBottom)
				- pxToNumber(style.borderTopWidth)
				- pxToNumber(style.borderBottomWidth);
		}
		element.style.height = numberToPx(height);
	}

	if (rect.width) {
		let width = 0;
		if (borderBox) {
			width = rect.width
				- pxToNumber(style.marginLeft)
				- pxToNumber(style.marginRight);
		}
		else {
			width = rect.width
				- pxToNumber(style.marginLeft)
				- pxToNumber(style.marginRight)
				- pxToNumber(style.paddingLeft)
				- pxToNumber(style.paddingRight)
				- pxToNumber(style.borderLeftWidth)
				- pxToNumber(style.borderRightWidth);
		}
		element.style.width = numberToPx(width);
	}

	if (rect.top) {
		element.style.top = numberToPx(rect.top);
	}

	if (rect.left) {
		element.style.left = numberToPx(rect.left);
	}
}

/**
 * Sets the dimensions of an Element's margin box.
 * @param element The Element to modify
 * @param rect An object containing optional number properties for height, left, top, and width
 */
export function setPaddingBox(element: HTMLElement, rect: SettableClientRect): void {
	const style = getComputedStyle(element);
	const borderBox = style.boxSizing && style.boxSizing === 'border-box';

	if (rect.height) {
		let height = 0;
		if (borderBox) {
			height = rect.height
				+ pxToNumber(style.borderTopWidth)
				+ pxToNumber(style.borderBottomWidth);
		}
		else {
			height = rect.height
				- pxToNumber(style.paddingTop)
				- pxToNumber(style.paddingBottom);
		}
		element.style.height = numberToPx(height);
	}

	if (rect.width) {
		let width = 0;
		if (borderBox) {
			width = rect.width
				+ pxToNumber(style.borderTopWidth)
				+ pxToNumber(style.borderBottomWidth);
		}
		else {
			width = rect.width
				- pxToNumber(style.paddingLeft)
				- pxToNumber(style.paddingRight);
		}
		element.style.width = numberToPx(width);
	}

	if (rect.top) {
		element.style.top = numberToPx(rect.top
			- pxToNumber(style.marginTop)
			- pxToNumber(style.borderTopWidth));
	}

	if (rect.left) {
		element.style.left = numberToPx(rect.left
			- pxToNumber(style.marginLeft)
			- pxToNumber(style.borderLeftWidth));
	}
}
