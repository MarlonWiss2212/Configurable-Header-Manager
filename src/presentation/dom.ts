const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Returns the value only if it is a valid hex colour, else "". Colours may come from
 *  imported JSON, so this guards against injection when interpolated into a style attribute. */
export function safeColor(value: string | undefined): string {
  return value && HEX_COLOR.test(value) ? value : "";
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Replace children by parsing HTML in an inert document — avoids direct innerHTML sinks. */
export function setHtml(element: HTMLElement, html: string): void {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  element.replaceChildren(...parsed.body.childNodes);
}

export function byId<TElement extends HTMLElement>(id: string): TElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element #${id} not found`);
  return element as TElement;
}

export function showView(id: string): void {
  document
    .querySelectorAll<HTMLElement>(".view")
    .forEach((view) => view.classList.toggle("active", view.id === id));
}

export function getRadioValue(name: string): string {
  return document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? "";
}

export function checkRadio(name: string, value: string): void {
  const radio = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blobUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(blobUrl);
}
