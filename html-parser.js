// @ts-check

/** @type {(strings: TemplateStringsArray, ...values: (string | function)[]) => Node} */
export const html = (strings, ...variables) => {
  /** @type {Map<string, string>} */
  const attributeMap = new Map();
  /** @type {Map<string, string>} */
  const textMap = new Map();
  /** @type {Map<string, function>} */
  const callbackMap = new Map();

  const placeholderString = strings.reduce(
    (placeholderString, string, index) => {
      const trimmedString = string.trim();
      const variable = variables[index];

      if (typeof variable === 'string' && trimmedString.at(-1) === '=') {
        const attribute = trimmedString.split(' ').at(-1)?.slice(0, -1);
        const placeholderId = `${attribute}-${index}`;
        const partialPlaceholderString = trimmedString.replace(
          `${attribute}=`,
          placeholderId
        );
        attributeMap.set(placeholderId, variable);

        return placeholderString + partialPlaceholderString;
      }

      if (typeof variable === 'string' && trimmedString.at(-1) === '>') {
        const placeholderId = `text-${index}`;
        const partialPlaceholderString = trimmedString + placeholderId;
        textMap.set(placeholderId, variable);

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
  replacePlaceholders(templateClone, attributeMap, textMap, callbackMap);

  return templateClone;
};

/** @type {(node: Node, attributeMap: Map<string, string>, textMap: Map<string, string>, callbackMap: Map<string, function>) => void} */
const replacePlaceholders = (node, attributeMap, textMap, callbackMap) => {
  attributeMap.forEach((attributeValue, placeholderId) => {
    const [attributeType] = placeholderId.split('-');
    const attributeNode = findAttributeNode(node, placeholderId);

    if (attributeNode) {
      attributeNode.setAttribute(attributeType, attributeValue);
      attributeNode.removeAttribute(placeholderId);
    }
  });

  textMap.forEach((text, placeholderId) => {
    const textNode = findTextNode(node, placeholderId);

    if (textNode) {
      textNode.textContent = text;
    }
  });

  callbackMap.forEach((callback, placeholderId) => {
    const [eventType] = placeholderId.split('-');
    const callbackNode = findCallbackNode(node, placeholderId);

    if (callbackNode) {
      // @ts-ignore
      callbackNode.addEventListener(eventType, callback);
      callbackNode.removeAttribute(placeholderId);
    }
  });
};

/** @type {(node: Node, placeholderId: string) => HTMLElement | undefined} */
const findAttributeNode = (node, placeholderId) => {
  if (node instanceof HTMLElement && node.hasAttribute(placeholderId)) {
    return node;
  }

  if (node.hasChildNodes()) {
    for (const childNode of node.childNodes) {
      const result = findAttributeNode(childNode, placeholderId);

      if (result) {
        return result;
      }
    }
  }

  return undefined;
};

/** @type {(node: Node, placeholderId: string) => Node | undefined} */
const findTextNode = (node, placeholderId) => {
  if (node.textContent?.trim() === placeholderId) {
    return node;
  }

  if (node.hasChildNodes()) {
    for (const childNode of node.childNodes) {
      const result = findTextNode(childNode, placeholderId);

      if (result) {
        return result;
      }
    }
  }

  return undefined;
};

/** @type {(node: Node, placeholderId: string) => HTMLElement | undefined} */
const findCallbackNode = (node, placeholderId) => {
  if (node instanceof HTMLElement && node.hasAttribute(placeholderId)) {
    return node;
  }

  if (node.hasChildNodes()) {
    for (const childNode of node.childNodes) {
      const result = findCallbackNode(childNode, placeholderId);

      if (result) {
        return result;
      }
    }
  }

  return undefined;
};
