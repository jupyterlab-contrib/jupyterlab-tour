export function triggerMouseEvent(
  node: Element,
  eventType: string,
  rect: DOMRect
): void {
  const clickEvent = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    clientX: rect.left,
    clientY: rect.top
  });
  node.dispatchEvent(clickEvent);
}
