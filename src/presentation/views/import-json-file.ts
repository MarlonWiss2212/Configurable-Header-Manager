import { byId } from "@/src/presentation/dom";

interface JsonFileImportHandlers {
  readJsonFile: (file: File) => Promise<string>;
  onLoaded: (json: string) => void;
  onError: (message: string) => void;
}

export function initJsonFileImport(handlers: JsonFileImportHandlers): void {
  // Firefox closes a browser-action popup as soon as a file picker opens
  // (Bugzilla #1292701), so file import cannot work there — hide the section.
  // Pasting JSON into the editor remains available.
  if (import.meta.env.FIREFOX) {
    byId<HTMLElement>("json-import-section").hidden = true;
    return;
  }

  byId<HTMLInputElement>("json-file-input").addEventListener(
    "change",
    (event) => void loadSelectedFile(event, handlers),
  );
  initDropZone(handlers);
}

export function resetJsonFileImport(): void {
  if (import.meta.env.FIREFOX) return;
  byId<HTMLInputElement>("json-file-input").value = "";
}

async function loadSelectedFile(event: Event, handlers: JsonFileImportHandlers): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) await readFile(file, handlers);
}

function initDropZone(handlers: JsonFileImportHandlers): void {
  const dropZone = byId<HTMLElement>("json-dropzone");
  const fileInput = byId<HTMLInputElement>("json-file-input");

  dropZone.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    fileInput.click();
  });
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = event.dataTransfer?.files[0];
    if (file) void readFile(file, handlers);
  });
}

async function readFile(file: File, handlers: JsonFileImportHandlers): Promise<void> {
  try {
    handlers.onLoaded(await handlers.readJsonFile(file));
  } catch (error) {
    handlers.onError(error instanceof Error ? error.message : "Could not read JSON file.");
  }
}
