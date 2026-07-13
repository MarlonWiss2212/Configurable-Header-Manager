import type { ImportExportHandlers } from "@/src/presentation/types/view-contracts";
import { byId, downloadFile, showView } from "@/src/presentation/dom";
import { initJsonFileImport, resetJsonFileImport } from "@/src/presentation/views/import-json-file";

export function initImportExportView(handlers: ImportExportHandlers): void {
  byId<HTMLButtonElement>("btn-back-ie").addEventListener("click", handlers.onCancel);
  byId<HTMLButtonElement>("btn-cancel-ie").addEventListener("click", handlers.onCancel);
  byId<HTMLButtonElement>("btn-fetch-url").addEventListener(
    "click",
    () => void fetchIntoEditor(handlers),
  );
  byId<HTMLInputElement>("url-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") void fetchIntoEditor(handlers);
  });
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
}

export function openImportExport(json: string): void {
  setEditorJson(json);
  resetJsonFileImport();
  clearError();
  showView("view-ie");
}

async function fetchIntoEditor(handlers: ImportExportHandlers): Promise<void> {
  const url = byId<HTMLInputElement>("url-input").value.trim();
  const fetchButton = byId<HTMLButtonElement>("btn-fetch-url");
  clearError();

  try {
    fetchButton.disabled = true;
    fetchButton.textContent = "Fetching...";
    setEditorJson(await handlers.fetchJsonFromUrl(url));
    byId<HTMLInputElement>("url-input").value = "";
  } catch (error) {
    showError(error instanceof Error ? error.message : "Fetch failed - check the URL and CORS.");
  } finally {
    fetchButton.disabled = false;
    fetchButton.textContent = "Fetch";
  }
}

async function saveFromEditor(handlers: ImportExportHandlers): Promise<void> {
  clearError();
  try {
    await handlers.onSave(byId<HTMLTextAreaElement>("json-area").value);
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
