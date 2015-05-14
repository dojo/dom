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
            assert.isNull(dom.byId('undefined'))
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
            assert.equal(reference.firstElementChild.nodeName, node.nodeName);
        },

        'when third argument is Position.Before, the first arg is placed before the second'() {
            let node = document.createElement('div'),
                reference = document.createElement('h1');

            document.body.appendChild(reference);
            dom.place(node, dom.Position.Before, reference);
            assert.equal(reference.previousSibling.nodeName, node.nodeName);
        },

        'when third argument is Position.After, the first arg is placed after the second'() {
            let node = document.createElement('div'),
                reference = document.createElement('h1');

            document.body.appendChild(reference);
            dom.place(node, dom.Position.After, reference);
            assert.equal(reference.nextSibling.nodeName, node.nodeName);
        },

        'when third argument is Position.Replace, the first arg replaces the second'() {
            let container = document.createElement('div'),
                node = document.createElement('span'),
                reference = document.createElement('h1');

            document.body.appendChild(container);
            container.appendChild(reference);
            dom.place(node, dom.Position.Replace, reference);
            assert.equal(container.firstElementChild.nodeName, node.nodeName);
        },

        'when third argument is Position.FirstIn, the first arg is placed as first child of second'() {
            var node = document.createElement('span'),
                reference = document.createElement('h1'),
                children =
                [
                    document.createElement('button'),
                    document.createElement('button'),
                    document.createElement('button')
                ];

            for (var i in children) {
                reference.appendChild(children[i]);
            }

            document.body.appendChild(reference);
            dom.place(node, dom.Position.FirstIn, reference);
            assert.equal(reference.firstElementChild.nodeName, node.nodeName);
            assert.equal(reference.children.length, children.length + 1);
        },

        'when third argument is Position.LastIn, the first arg is placed as last child of second'() {
            var node = document.createElement('span'),
                reference = document.createElement('h1'),
                children =
                [
                    document.createElement('button'),
                    document.createElement('button'),
                    document.createElement('button')
                ];

            for (var i in children) {
                reference.appendChild(children[i]);
            }

            document.body.appendChild(reference);
            dom.place(node, dom.Position.LastIn, reference);
            assert.equal(reference.lastElementChild.nodeName, node.nodeName);
            assert.equal(reference.children.length, children.length + 1);
        }
    }
});
