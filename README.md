[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/cookie-manager.svg)](https://www.npmjs.com/package/@advanced-rest-client/cookie-manager)

[![Build Status](https://travis-ci.org/advanced-rest-client/cookie-manager.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/cookie-manager)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/cookie-manager)

# cookie-manager

A manager for session cookies. Renders a list of cookies that can be edited.

Cooke access is different in web, Chrome App, and Electron app. Each application should handle cookies requests by their own.

## Usage

### Installation
```
npm install --save @advanced-rest-client/cookie-manager
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import './node_modules/@advanced-rest-client/cookie-manager/cookie-manager.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <cookie-manager></cookie-manager>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/cookie-manager
cd cookie-manager
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
