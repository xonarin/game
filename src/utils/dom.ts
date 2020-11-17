export const placeCaretAfter = (parent: HTMLElement, elem: Node) => {
    const selection = window.getSelection();
    if (!selection) return;

    parent.focus();

    const range = document.createRange();
    range.setStartAfter(elem);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
};

export default { placeCaretAfter };
