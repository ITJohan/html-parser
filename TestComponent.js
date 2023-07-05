// @ts-check

import { html } from './html-parser.js';

class TestComponent extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });
  label = 'Click me';

  constructor() {
    super();
    this.shadowRoot.appendChild(html`<button>${this.label}</button>`);
  }
}

customElements.define('test-component', TestComponent);
