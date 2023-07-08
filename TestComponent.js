// @ts-check

import { html } from './html-parser.js';

class TestComponent extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });
  text = 'Hello world!';
  label = 'Click me';
  id = 'testid';

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    this[name] = newValue;

    this.render();
  }

  render() {
    this.shadowRoot.replaceChildren(html`
      <main>
        ${this.text}
        <section id=${this.id}>
          <p>Hello</p>
          <button @click=${() => console.log('testing')}>${this.label}</button>
          <ul>
            ${[1, 2, 3].map(
              (number) => html`<li test=${number}>${number}</li>`
            )}
          </ul>
        </section>
        <footer>This is the footer</footer>
        <p>${this.text}</p>
        ${this.label}
      </main>
    `);
  }
}

customElements.define('test-component', TestComponent);
