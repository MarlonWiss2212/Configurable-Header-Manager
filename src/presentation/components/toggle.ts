import { escapeHtml } from "@/src/presentation/dom";

export function toggleHtml(checkboxHtml: string, title: string): string {
  return `
    <label class="toggle" title="${escapeHtml(title)}">
      ${checkboxHtml}
      <span class="toggle-track"><span class="toggle-thumb"></span></span>
    </label>`;
}
