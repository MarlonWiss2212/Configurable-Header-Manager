import { escapeHtml } from "@/src/presentation/dom";

export type IconName =
  | "add"
  | "back"
  | "chevron"
  | "delete"
  | "download"
  | "duplicate"
  | "edit"
  | "folder"
  | "pulse"
  | "import-json"
  | "arrow-up"
  | "arrow-down";

export function icon(name: IconName, label = ""): string {
  const alt = escapeHtml(label);
  return `<img class="icon icon-${name}" src="/icons/${name}.svg" alt="${alt}" aria-hidden="${
    label ? "false" : "true"
  }">`;
}
