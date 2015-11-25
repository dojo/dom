import { add } from 'dojo-core/has';

add('dom-element-matches', function () {
	let node = document.body;
	// TS typings include the vendor-prefixed methods used here, but not the standard
	if (typeof (<any> node).matches === 'function') {
		return 'matches';
	}
	if (typeof node.msMatchesSelector === 'function') {
		return 'msMatchesSelector';
	}
});

export { cache, add, default } from 'dojo-core/has';
