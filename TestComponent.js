// @ts-check

import { html } from './html-parser.js';

class TestComponent extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });
  text = 'Hello world!';
  label = 'Click me';
  id = 'testid';

  constructor() {
    super();
    this.shadowRoot.appendChild(
      html`
        <main>
          ${this.text}
          <section id=${this.id}>
            <p>Hello</p>
            <button @click=${() => console.log('testing')}>
              ${this.label}
            </button>
          </section>
          <footer>This is the footer</footer>
          <p>${this.text}</p>
          ${this.label}
        </main>
      `
    );
  }
}

customElements.define('test-component', TestComponent);
