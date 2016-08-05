export interface CreateArgs {
	[key: string]: string | { [key: string]: string };
	attributes?: { [key: string]: string };
}

export interface HTMLPhraseElement extends HTMLElement {
	cite: string;
	dateTime: string;
}

declare var HTMLPhraseElement: {
	prototype: HTMLPhraseElement;
	new(): HTMLPhraseElement;
};

export interface CreateFunction {
	// These signatures are largely based on dom.generated.d.ts, minus obsolete tags.
	(tagName: 'a', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLAnchorElement;
	(tagName: 'abbr', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'acronym', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'address', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement;
	(tagName: 'area', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLAreaElement;
	(tagName: 'audio', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLAudioElement;
	(tagName: 'b', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'base', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBaseElement;
	(tagName: 'bdo', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'big', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'blockquote', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement;
	(tagName: 'body', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBodyElement;
	(tagName: 'br', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBRElement;
	(tagName: 'button', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLButtonElement;
	(tagName: 'canvas', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLCanvasElement;
	(tagName: 'caption', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableCaptionElement;
	(tagName: 'center', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement;
	(tagName: 'cite', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'code', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'col', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableColElement;
	(tagName: 'colgroup', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableColElement;
	(tagName: 'datalist', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLDataListElement;
	(tagName: 'dd', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement;
	(tagName: 'del', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLModElement;
	(tagName: 'dfn', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'div', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLDivElement;
	(tagName: 'dl', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLDListElement;
	(tagName: 'dt', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement;
	(tagName: 'em', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'embed', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLEmbedElement;
	(tagName: 'fieldset', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLFieldSetElement;
	(tagName: 'font', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLFontElement;
	(tagName: 'form', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLFormElement;
	(tagName: 'h1', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
	(tagName: 'h2', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
	(tagName: 'h3', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
	(tagName: 'h4', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
	(tagName: 'h5', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
	(tagName: 'h6', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
	(tagName: 'head', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadElement;
	(tagName: 'hr', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHRElement;
	(tagName: 'i', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'iframe', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLIFrameElement;
	(tagName: 'img', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLImageElement;
	(tagName: 'input', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLInputElement;
	(tagName: 'ins', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLModElement;
	(tagName: 'isindex', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLUnknownElement;
	(tagName: 'kbd', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'keygen', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement;
	(tagName: 'label', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLLabelElement;
	(tagName: 'legend', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLLegendElement;
	(tagName: 'li', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLLIElement;
	(tagName: 'link', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLLinkElement;
	(tagName: 'map', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLMapElement;
	(tagName: 'menu', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLMenuElement;
	(tagName: 'meta', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLMetaElement;
	(tagName: 'nobr', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'object', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLObjectElement;
	(tagName: 'ol', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLOListElement;
	(tagName: 'optgroup', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLOptGroupElement;
	(tagName: 'option', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLOptionElement;
	(tagName: 'p', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLParagraphElement;
	(tagName: 'param', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLParamElement;
	(tagName: 'pre', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPreElement;
	(tagName: 'progress', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLProgressElement;
	(tagName: 'q', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLQuoteElement;
	(tagName: 'rt', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'ruby', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 's', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'samp', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'script', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLScriptElement;
	(tagName: 'select', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLSelectElement;
	(tagName: 'small', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'source', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLSourceElement;
	(tagName: 'span', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLSpanElement;
	(tagName: 'strong', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'style', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLStyleElement;
	(tagName: 'sub', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'sup', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'table', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableElement;
	(tagName: 'tbody', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableSectionElement;
	(tagName: 'td', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableDataCellElement;
	(tagName: 'textarea', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTextAreaElement;
	(tagName: 'tfoot', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableSectionElement;
	(tagName: 'th', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableHeaderCellElement;
	(tagName: 'thead', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableSectionElement;
	(tagName: 'title', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTitleElement;
	(tagName: 'tr', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableRowElement;
	(tagName: 'track', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTrackElement;
	(tagName: 'tt', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'u', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'ul', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLUListElement;
	(tagName: 'var', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
	(tagName: 'video', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLVideoElement;
	(tagName: string, kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement;
}
