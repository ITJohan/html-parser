// @ts-check

/** @type {(strings: TemplateStringsArray, ...values: (string | function)[]) => Node} */
export function html(strings, ...values) {
  const template = document.createElement('template');

  console.log(strings);
  console.log(values);

  strings.map((string, index) => {
    const regex = /<(\w+)/;
    const match = string.match(regex);

    if (match) {
      const isolatedElementType = match[1];
      const element = document.createElement(isolatedElementType);

      if (values[index]) {
        const string = String(values[index]);
        element.appendChild(document.createTextNode(string));
      }

      template.content.appendChild(element);
    }
  });

  return template.content.cloneNode(true);
}
