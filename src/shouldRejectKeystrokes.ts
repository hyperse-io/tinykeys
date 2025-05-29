type shouldRejectKeystrokesProps = {
  ignoreWhenFocused: string[];
};

export function shouldRejectKeystrokes(
  props: shouldRejectKeystrokesProps = { ignoreWhenFocused: [] }
) {
  const inputs = ['input', 'textarea', ...props.ignoreWhenFocused].map((el) =>
    el.toLowerCase()
  );

  const activeElement = document.activeElement;

  const ignoreStrokes =
    activeElement &&
    (inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1 ||
      activeElement.attributes.getNamedItem('role')?.value === 'textbox' ||
      activeElement.attributes.getNamedItem('contenteditable')?.value ===
        'true' ||
      activeElement.attributes.getNamedItem('contenteditable')?.value ===
        'plaintext-only');

  return ignoreStrokes;
}
