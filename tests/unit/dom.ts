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
            assert.equal(reference.firstElementChild.nodeName, node.nodeName);
            assert.equal(reference.children.length, children.length + 1);
        },

        'when third argument is Position.LastIn, the first arg is placed as last child of second'() {
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
            assert.equal(reference.lastElementChild.nodeName, node.nodeName);
            assert.equal(reference.children.length, children.length + 1);
        }
    },

    fromString: {
        'returns document fragment for single node'() {
            let result = dom.fromString('<div></div>');
            assert.equal(result.firstChild.nodeName.toLowerCase(), 'div');
            assert.equal(result.nodeName.toLowerCase(), '#document-fragment');
        },

        'returns correct fragment for tree'() {
            let parent = document.createElement('div'),
                child = document.createElement('span');

            parent.appendChild(child);
            let fragment = dom.fromString(parent.outerHTML);

            assert.equal((<HTMLElement> fragment.firstChild).outerHTML, parent.outerHTML);
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
                assert.equal(fragment.childNodes[i].nodeName.toLowerCase(),
                    parent.childNodes[i].nodeName.toLowerCase());
            }
        },

        '<option> created inside <select>'() {
            let fragment = dom.fromString('<option></option>');
            assert.equal(fragment.firstChild.nodeName.toLowerCase(), 'select');
        },

        '<tbody> created inside <table>'() {
            let fragment = dom.fromString('<tbody></tbody>');
            assert.equal(fragment.firstChild.nodeName.toLowerCase(), 'table');
        },

        '<thead> created inside <table>'() {
            let fragment = dom.fromString('<thead></thead>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'table');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'thead');
        },

        '<tfoot> created inside <table>'() {
            let fragment = dom.fromString('<tfoot></tfoot>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'table');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'tfoot');
        },

        '<tr> created inside <tbody> inside <table>'() {
            let fragment = dom.fromString('<tr></tr>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'table');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'tbody');
            assert.equal(child.firstChild.firstChild.nodeName.toLowerCase(), 'tr');
        },

        '<td> created inside <tr> inside <tbody> inside <table>'() {
            let fragment = dom.fromString('<td></td>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'table');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'tbody');
            assert.equal(child.firstChild.firstChild.nodeName.toLowerCase(), 'tr');
            assert.equal(child.firstChild.firstChild.firstChild.nodeName.toLowerCase(), 'td');
        },

        '<td> created inside <tr> inside <thead> inside <table>'() {
            let fragment = dom.fromString('<th></th>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'table');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'thead');
            assert.equal(child.firstChild.firstChild.nodeName.toLowerCase(), 'tr');
            assert.equal(child.firstChild.firstChild.firstChild.nodeName.toLowerCase(), 'th');

        },

        '<legend> created inside <fieldset>'() {
            let fragment = dom.fromString('<legend></legend>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'fieldset');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'legend');
        },

        '<caption> created inside <table>'() {
            let fragment = dom.fromString('<caption></caption>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'table');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'caption');
        },

        '<colgroup> created inside <table>'() {
            let fragment = dom.fromString('<colgroup></colgroup>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'table');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'colgroup');
        },

        '<col> created inside <colgroup> inside <table>'() {
            let fragment = dom.fromString('<col></col>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'table');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'colgroup');
            assert.equal(child.firstChild.firstChild.nodeName.toLowerCase(), 'col');
        },

        '<li> created inside <ul>'() {
            let fragment = dom.fromString('<li></li>');
            let child = fragment.firstChild;
            assert.equal(child.nodeName.toLowerCase(), 'ul');
            assert.equal(child.firstChild.nodeName.toLowerCase(), 'li');
        }
    }
});
