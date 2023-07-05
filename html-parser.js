// @ts-check

/** @type {Map<string, string>} */
const textMap = new Map();
/** @type {Map<string, function>} */
const callbackMap = new Map();

let id = 0;

/** @type {(strings: TemplateStringsArray, ...values: (string | function)[]) => Node} */
export const html = (strings, ...variables) => {
  const placeholderString = strings.reduce(
    (placeholderString, string, index) => {
      const variable = variables[index];

      if (typeof variable === 'string') {
        const placeholderId = `text-${id}`;
        const partialPlaceholderString = string + placeholderId;
        textMap.set(placeholderId, variable);
        id++;

        return placeholderString + partialPlaceholderString;
      }

      if (typeof variable === 'function') {
        const eventType = string.split('@')[1].split('=')[0];
        const placeholderId = `${eventType}-${id}`;
        const partialPlaceholderString = string.replace(
          `@${eventType}=`,
          placeholderId
        );
        callbackMap.set(placeholderId, variable);
        id++;

        return placeholderString + partialPlaceholderString;
      }

      return placeholderString + string;
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
  replacePlaceholders(templateClone, textMap, callbackMap);

  return templateClone;
};

/** @type {(node: Node, textMap: Map<string, string>, callbackMap: Map<string, function>) => void} */
const replacePlaceholders = (node, textMap, callbackMap) => {
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
