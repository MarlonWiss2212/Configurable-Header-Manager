/** Escape a value for safe innerHTML insertion */
export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Get a DOM element by ID */
export function $<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

/** Get the value of the checked radio input in a group */
export function getRadio(name: string): string {
  return document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? '';
}

/** Check a specific radio input by name + value */
export function setRadio(name: string, value: string): void {
  const el = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
  if (el) el.checked = true;
}

/** Generate the next available integer ID */
export function nextId(rules: { id: number }[]): number {
  return rules.length === 0 ? 1 : Math.max(...rules.map((r) => r.id)) + 1;
}
