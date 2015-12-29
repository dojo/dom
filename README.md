# dojo-dom

[![Build Status](https://travis-ci.org/dojo/dom.svg?branch=master)](https://travis-ci.org/dojo/dom)
[![codecov.io](http://codecov.io/github/dojo/dom/coverage.svg?branch=master)](http://codecov.io/github/dojo/dom?branch=master)


The dom package provides utilities for DOM manipulation and event handling/delegation in browser runtimes.
It encourages (and shims) standard DOM methods where possible, but also provides utilities to make
common and recommended use cases easy and obvious, and harder use cases less painful.

## Features

This section currently contains a limited high-level synopsis.  Further details will be added when APIs are implemented.

### DOM Manipulation

* `dom.byId` - Retrieves an element by ID (shorthand for `document.getElementById`)
* `dom.create` - Creates an element
* `dom.fromString` - Creates an element or elements from a string of HTML
* `dom.place` - Places a node relative to another element

### CSS Class Manipulation

The class manipulation APIs provide analogues to the `DOMTokenList` API.  They will delegate to `classList`
when available, adding logic when necessary to comply with the more recent parts of the standard
(e.g. multiple add/remove arguments, optional force parameter for toggle).

* `dom.addClass` - Adds one or more classes to an element
* `dom.containsClass` - Tests if a particular class exists on an element
* `dom.removeClass` - Removes one or more classes from an element
* `dom.toggleClass` - Toggles a class on an element, optionally accepting a boolean to specifically add or remove

### CSS Style Manipulation

The dom package provides APIs for adding and removing styles *in a stylesheet*, rather than inline.  This allows
styles to be added programmatically on a per-selector basis, which is often more flexible and efficient than
setting styles directly inline on one element.

* `dom.addStyleDeclaration` - Creates a `CSSStyleDeclaration`, adds it to a stylesheet in the page, and returns it
* `dom.removeStyleDeclaration` - Removes a `CSSStyleDeclaration` that was created with `addStyleDeclaration`

The dom package does *not* provide helpers for setting inline styles, as `element.style` generally accomplishes that,
but moreover, inline styles should be discouraged as they override stylesheets and can be difficult to maintain.

### CSS Class Application for Feature Tests

`dom.applyFeatureClass` accepts any number of feature test names (registered with the `has` module), and adds
corresponding classes to the document element.

### Form Manipulation

These APIs are implemented in a separate `dom/form` module.

* `form.toObject` - Serializes the values in a form into a JavaScript object
* `form.fromObject` - Populates a DOM form's fields from a JavaScript object

### DOM Events

The `dojo-core/on` module already contains basic support for registering and removing DOM event handlers.
The dom package adds APIs for event delegation in the `delegate` module.

## How do I use this package?

Users will need to download and compile directly from this repository and
[dojo/core](https://github.com/dojo/core) for the time being.
Precompiled AMD/CommonJS modules will be provided in the near future as our release tools are improved.

Once you've downloaded `dojo-core` and `dojo-dom`, perform the following steps:

```sh
cd dojo-core
grunt dist
cd dist
npm link
cd ../../dojo-dom
npm install # (if you haven't already done this)
npm link dojo-core
```

## How do I contribute?

We appreciate your interest!  Please see the [Guidelines Repository](https://github.com/dojo/guidelines#readme) for the
Contributing Guidelines and Style Guide.

## Testing

Test cases MUST be written using Intern using the Object test interface and Assert assertion interface.

90% branch coverage MUST be provided for all code submitted to this repository, as reported by istanbul’s combined coverage results for all supported platforms.

## Licensing information

© 2004–2015 Dojo Foundation & contributors. [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.

