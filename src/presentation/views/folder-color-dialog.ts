import { COLOR_PALETTE } from "@/src/presentation/colors";
import { byId, safeColor, setHtml } from "@/src/presentation/dom";

let onPick: ((color: string) => void) | null = null;

export function initFolderColorDialog(): void {
  const dialog = byId<HTMLElement>("folder-color-dialog");
  setHtml(byId<HTMLElement>("folder-color-swatches"), swatchesHtml());

  dialog.querySelectorAll<HTMLButtonElement>(".dialog-swatch").forEach((button) => {
    button.addEventListener("click", () => {
      onPick?.(button.dataset.color ?? "");
      close();
    });
  });
  byId<HTMLButtonElement>("folder-color-cancel").addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close(); // click on the backdrop
  });
}

export function openFolderColorDialog(currentColor: string, pick: (color: string) => void): void {
  onPick = pick;
  const dialog = byId<HTMLElement>("folder-color-dialog");
  dialog.querySelectorAll<HTMLButtonElement>(".dialog-swatch").forEach((button) => {
    button.classList.toggle("is-selected", (button.dataset.color ?? "") === currentColor);
  });
  dialog.hidden = false;
}

function close(): void {
  byId<HTMLElement>("folder-color-dialog").hidden = true;
  onPick = null;
}

function swatchesHtml(): string {
  const swatch = (value: string, label: string, extra: string): string => {
    const safe = safeColor(value);
    return `<button type="button" class="swatch dialog-swatch${extra}" data-color="${safe}"${
      safe ? ` style="--swatch: ${safe}"` : ""
    } title="${label}" aria-label="${label}"></button>`;
  };

  return (
    swatch("", "No colour", " swatch-none") +
    COLOR_PALETTE.map((entry) => swatch(entry.value, entry.name, "")).join("")
  );
}
