// @ts-check

/**
 * @param {TemplateStringsArray} strings
 * @param {(string | number | function | Node[])[]} variables
 * @returns {Node}
 */
export const html = (strings, ...variables) => {
  /** @type {Map<string, string>} */
  const attributeMap = new Map();
  /** @type {Map<string, string>} */
  const textMap = new Map();
  /** @type {Map<string, function>} */
  const callbackMap = new Map();
  /** @type {Map<string, Node[]>} */
  const arrayMap = new Map();

  const placeholderString = strings.reduce(
    (placeholderString, string, index) => {
      const trimmedString = string.trim();
      const variable = variables[index];

      if (
        (typeof variable === 'string' || typeof variable === 'number') &&
        trimmedString.at(-1) === '='
      ) {
        const attribute = trimmedString.split(' ').at(-1)?.slice(0, -1);
        const placeholderId = `${attribute}-${index}`;
        const partialPlaceholderString = trimmedString.replace(
          `${attribute}=`,
          placeholderId
        );
        attributeMap.set(placeholderId, String(variable));

        return placeholderString + partialPlaceholderString;
      }

      if (
        (typeof variable === 'string' || typeof variable === 'number') &&
        trimmedString.at(-1) === '>'
      ) {
        const placeholderId = `text-${index}`;
        const partialPlaceholderString = trimmedString + placeholderId;
        textMap.set(placeholderId, String(variable));

        return placeholderString + partialPlaceholderString;
      }

      if (typeof variable === 'function' && trimmedString.at(-1) === '=') {
        const eventType = trimmedString.split('@')[1].split('=')[0];
        const placeholderId = `${eventType}-${index}`;
        const partialPlaceholderString = trimmedString.replace(
          `@${eventType}=`,
          placeholderId
        );
        callbackMap.set(placeholderId, variable);

        return placeholderString + partialPlaceholderString;
      }

      if (variable instanceof Array && trimmedString.at(-1) === '>') {
        const placeholderId = `array-${index}`;
        const partialPlaceholderString = trimmedString + placeholderId;
        arrayMap.set(placeholderId, variable);

        return placeholderString + partialPlaceholderString;
      }

      return placeholderString + trimmedString;
    },
    ''
  );

  const parser = new DOMParser();
  const dom = parser.parseFromString(placeholderString, 'text/html');
  const template = document.createElement('template');

  Array.from(dom.body.children).forEach((child) => {
    template.content.appendChild(child);
  });

  const templateClone = template.content.cloneNode(true);
  replacePlaceholders(
    templateClone,
    attributeMap,
    textMap,
    callbackMap,
    arrayMap
  );

  return templateClone;
};

/**
 * @param {Node} node
 * @param {Map<string, string>} attributeMap
 * @param {Map<string, string>} textMap
 * @param {Map<string, function>} callbackMap
 * @param {Map<string, Node[]>} arrayMap
 */
const replacePlaceholders = (
  node,
  attributeMap,
  textMap,
  callbackMap,
  arrayMap
) => {
  attributeMap.forEach((attributeValue, placeholderId) => {
    const [attributeType] = placeholderId.split('-');
    const attributeNode = findInlineNode(node, placeholderId);

    if (attributeNode) {
      attributeNode.setAttribute(attributeType, attributeValue);
      attributeNode.removeAttribute(placeholderId);
    }
  });

  textMap.forEach((text, placeholderId) => {
    const textNode = findNestedNode(node, placeholderId);

    if (textNode) {
      textNode.textContent = text;
    }
  });

  callbackMap.forEach((callback, placeholderId) => {
    const [eventType] = placeholderId.split('-');
    const callbackNode = findInlineNode(node, placeholderId);

    if (callbackNode) {
      // @ts-ignore
      callbackNode.addEventListener(eventType, callback);
      callbackNode.removeAttribute(placeholderId);
    }
  });

  arrayMap.forEach((array, placeholderId) => {
    const textNode = findNestedNode(node, placeholderId);

    if (textNode && textNode.parentElement) {
      textNode.parentElement?.replaceChildren(...array);
    }
  });
};

/**
 * @param {Node} node
 * @param {string} placeholderId
 * @returns {Node | undefined}
 */
const findNestedNode = (node, placeholderId) => {
  if (node instanceof Text && node.textContent === placeholderId) {
    return node;
  }

  if (node.hasChildNodes()) {
    for (const childNode of node.childNodes) {
      const result = findNestedNode(childNode, placeholderId);

      if (result) {
        return result;
      }
    }
  }

  return undefined;
};

/**
 * @param {Node} node
 * @param {string} placeholderId
 * @returns {HTMLElement | undefined}
 */
const findInlineNode = (node, placeholderId) => {
  if (node instanceof HTMLElement && node.hasAttribute(placeholderId)) {
    return node;
  }

  if (node.hasChildNodes()) {
    for (const childNode of node.childNodes) {
      const result = findInlineNode(childNode, placeholderId);

      if (result) {
        return result;
      }
    }
  }

  return undefined;
};
