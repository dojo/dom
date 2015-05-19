import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import * as dom from 'src/dom';

let element: HTMLElement;

registerSuite({
	name: 'dom',

	setup() {
		element = document.createElement('span');
		element.id = 'id';
	},

	teardown() {
		element.parentElement.removeChild(element);
	},

	byId: {
		'result found'() {
			document.body.appendChild(element);
			assert.strictEqual(dom.byId('id').id, 'id');
		},

		'result not found'() {
			assert.isNull(dom.byId('undefined'));
		}
	},

	place: {
		'throws if reference node not in DOM'() {
			let node = document.createElement('div'),
				reference = document.createElement('h1');

			assert.throws(function () {
				dom.place(node, dom.Position.FirstIn, reference);
			});
		},

		'relative element'() {
			let node = document.createElement('div'),
				reference = document.createElement('h1');

			document.body.appendChild(reference);
			dom.place(node, dom.Position.FirstIn, reference);
			assert.strictEqual(reference.firstElementChild.nodeName, node.nodeName);
		},

		'when position argument is Position.Before, the node is placed before the reference node'() {
			let node = document.createElement('div'),
				reference = document.createElement('h1');

			document.body.appendChild(reference);
			dom.place(node, dom.Position.Before, reference);
			assert.strictEqual(reference.previousSibling.nodeName, node.nodeName);
		},

		'when position argument is Position.After, the node is placed after the reference node'() {
			let node = document.createElement('div'),
				reference = document.createElement('h1');

			document.body.appendChild(reference);
			dom.place(node, dom.Position.After, reference);
			assert.strictEqual(reference.nextSibling.nodeName, node.nodeName);
		},

		'when position argument is Position.Replace, the node replaces the reference node'() {
			let container = document.createElement('div'),
				node = document.createElement('span'),
				reference = document.createElement('h1');

			document.body.appendChild(container);
			container.appendChild(reference);
			dom.place(node, dom.Position.Replace, reference);
			assert.strictEqual(container.firstElementChild.nodeName, node.nodeName);
		},

		'when position argument is Position.FirstIn, the node is placed as first child of reference node'() {
			let node = document.createElement('span'),
				reference = document.createElement('h1'),
				children =
				[
					document.createElement('button'),
					document.createElement('button'),
					document.createElement('button')
				];

			for (let child of children) {
				reference.appendChild(child);
			}

			document.body.appendChild(reference);
			dom.place(node, dom.Position.FirstIn, reference);
			assert.strictEqual(reference.firstElementChild.nodeName, node.nodeName);
			assert.strictEqual(reference.children.length, children.length + 1);
		},

		'when position argument is Position.LastIn, the node is placed as last child of reference node'() {
			let node = document.createElement('span'),
				reference = document.createElement('h1'),
				children =
				[
					document.createElement('button'),
					document.createElement('button'),
					document.createElement('button')
				];

			for (let child of children) {
				reference.appendChild(child);
			}

			document.body.appendChild(reference);
			dom.place(node, dom.Position.LastIn, reference);
			assert.strictEqual(reference.lastElementChild.nodeName, node.nodeName);
			assert.strictEqual(reference.children.length, children.length + 1);
		}
	},

	fromString: {
		'returns document fragment for single node'() {
			let result = dom.fromString('<div></div>');
			assert.strictEqual(result.firstChild.nodeName.toLowerCase(), 'div');
			assert.strictEqual(result.nodeName.toLowerCase(), '#document-fragment');
		},

		'returns correct fragment for tree'() {
			let parent = document.createElement('div'),
				child = document.createElement('span');

			parent.appendChild(child);
			let fragment = dom.fromString(parent.outerHTML);

			assert.strictEqual((<HTMLElement> fragment.firstChild).outerHTML, parent.outerHTML);
		},

		'returns correct fragment for forest'() {
			let parent = document.createElement('div'),
				children = [
					document.createElement('span'),
					document.createElement('div')
				];

			for (let child of children) {
				parent.appendChild(child);
			}

			let fragment = dom.fromString(parent.innerHTML);
			for (let i in children) {
				assert.strictEqual(fragment.childNodes[i].nodeName.toLowerCase(),
					parent.childNodes[i].nodeName.toLowerCase());
			}
		},

		'<option> created inside <select>'() {
			let fragment = dom.fromString('<option></option>');
			assert.strictEqual(fragment.firstChild.nodeName.toLowerCase(), 'select');
		},

		'<tbody> created inside <table>'() {
			let fragment = dom.fromString('<tbody></tbody>');
			assert.strictEqual(fragment.firstChild.nodeName.toLowerCase(), 'table');
		},

		'<thead> created inside <table>'() {
			let fragment = dom.fromString('<thead></thead>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'table');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'thead');
		},

		'<tfoot> created inside <table>'() {
			let fragment = dom.fromString('<tfoot></tfoot>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'table');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'tfoot');
		},

		'<tr> created inside <tbody> inside <table>'() {
			let fragment = dom.fromString('<tr></tr>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'table');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'tbody');
			assert.strictEqual(child.firstChild.firstChild.nodeName.toLowerCase(), 'tr');
		},

		'<td> created inside <tr> inside <tbody> inside <table>'() {
			let fragment = dom.fromString('<td></td>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'table');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'tbody');
			assert.strictEqual(child.firstChild.firstChild.nodeName.toLowerCase(), 'tr');
			assert.strictEqual(child.firstChild.firstChild.firstChild.nodeName.toLowerCase(), 'td');
		},

		'<td> created inside <tr> inside <thead> inside <table>'() {
			let fragment = dom.fromString('<th></th>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'table');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'thead');
			assert.strictEqual(child.firstChild.firstChild.nodeName.toLowerCase(), 'tr');
			assert.strictEqual(child.firstChild.firstChild.firstChild.nodeName.toLowerCase(), 'th');

		},

		'<legend> created inside <fieldset>'() {
			let fragment = dom.fromString('<legend></legend>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'fieldset');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'legend');
		},

		'<caption> created inside <table>'() {
			let fragment = dom.fromString('<caption></caption>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'table');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'caption');
		},

		'<colgroup> created inside <table>'() {
			let fragment = dom.fromString('<colgroup></colgroup>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'table');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'colgroup');
		},

		'<col> created inside <colgroup> inside <table>'() {
			let fragment = dom.fromString('<col></col>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'table');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'colgroup');
			assert.strictEqual(child.firstChild.firstChild.nodeName.toLowerCase(), 'col');
		},

		'<li> created inside <ul>'() {
			let fragment = dom.fromString('<li></li>');
			let child = fragment.firstChild;
			assert.strictEqual(child.nodeName.toLowerCase(), 'ul');
			assert.strictEqual(child.firstChild.nodeName.toLowerCase(), 'li');
		}
	}
});
