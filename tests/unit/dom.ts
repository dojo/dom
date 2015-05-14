import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import * as dom from 'src/dom';

let container,
    iframe,
    node,
    nodeId,
    iframeChild,
    iframeChildId;

registerSuite({
	name: 'lang functions',

	setup() {
		container = document.createElement('div');
		iframe = document.createElement('iframe');
		node = document.createElement('span');
		nodeId = getId();
		document.body.appendChild(container);
		container.appendChild(iframe);
		container.appendChild(node);

		iframeChild = iframe.contentDocument.createElement('div');
		iframeChildId = getId();

		setTimeout(function () { //make async because FF seems to need a bit to setup the iframe's contentDocument after adding to the page
			iframe.contentDocument.body.appendChild(iframeChild);

			node.id = nodeId;
			iframeChild.id = iframeChildId;
		}, 0);

	},

	teardown() {
		document.body.removeChild(container);
	},

	// 'node'() {
	// 	var result = dom.byId(node);
	// 	assert.equal(result, node);
	// },

	'string'() {
		var result = dom.byId(nodeId);
		assert.equal(result, node);
	}

	'string + document' () {
		var result = dom.byId(iframeChildId, iframe.contentDocument);
		assert.equal(result, iframeChild);
	}

	'non-existent node returns null' () {
		var result = dom.byId(getId());
		assert.isNull(result);
	}
});
