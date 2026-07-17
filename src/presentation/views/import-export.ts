import type { ImportExportHandlers, ImportMode } from "@/src/presentation/types/view-contracts";
import { byId, downloadFile, getRadioValue, showView } from "@/src/presentation/dom";
import { initJsonFileImport, resetJsonFileImport } from "@/src/presentation/views/import-json-file";

// The current configuration JSON, shown in the editor in Replace mode.
let currentJson = "";

export function initImportExportView(handlers: ImportExportHandlers): void {
  byId<HTMLButtonElement>("btn-back-ie").addEventListener("click", handlers.onCancel);
  initJsonFileImport({
    readJsonFile: handlers.readJsonFile,
    onLoaded: setEditorJson,
    onError: showError,
  });
  byId<HTMLButtonElement>("btn-download").addEventListener("click", () =>
    downloadFile("header-manager-rules.json", handlers.getJson(), "application/json"),
  );
  byId<HTMLButtonElement>("btn-save-ie").addEventListener(
    "click",
    () => void saveFromEditor(handlers),
  );
  // Replace shows the full current config to edit; Merge starts empty to paste additions into.
  document
    .querySelectorAll<HTMLInputElement>('input[name="import-mode"]')
    .forEach((radio) => radio.addEventListener("change", syncEditorToMode));
}

export function openImportExport(json: string): void {
  currentJson = json;
  resetJsonFileImport();
  clearError();
  syncEditorToMode();
  showView("view-ie");
}

function syncEditorToMode(): void {
  const mode = (getRadioValue("import-mode") || "merge") as ImportMode;
  setEditorJson(mode === "replace" ? currentJson : "");
}

async function saveFromEditor(handlers: ImportExportHandlers): Promise<void> {
  const mode = (getRadioValue("import-mode") || "merge") as ImportMode;
  clearError();
  try {
    await handlers.onSave(byId<HTMLTextAreaElement>("json-area").value, mode);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Invalid JSON");
  }
}

function setEditorJson(json: string): void {
  clearError();
  byId<HTMLTextAreaElement>("json-area").value = json;
}

function showError(message: string): void {
  const errorElement = byId<HTMLElement>("ie-error");
  errorElement.textContent = message;
  errorElement.hidden = false;
}

function clearError(): void {
  const errorElement = byId<HTMLElement>("ie-error");
  errorElement.textContent = "";
  errorElement.hidden = true;
}
