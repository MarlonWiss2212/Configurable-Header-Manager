import { beforeEach, describe, expect, it, vi } from "vitest";
import { initImportExportView, openImportExport } from "@/src/presentation/views/import-export";

const FIXTURE = `
  <button id="btn-back-ie"></button>
  <button id="btn-cancel-ie"></button>
  <input id="url-input">
  <button id="btn-fetch-url"></button>
  <label id="json-dropzone" for="json-file-input" tabindex="0">
    <span>Import from JSON</span>
  </label>
  <input id="json-file-input" type="file">
  <button id="btn-download"></button>
  <button id="btn-save-ie"></button>
  <button id="btn-save-ie-header"></button>
  <textarea id="json-area"></textarea>
  <div id="ie-error" hidden></div>
  <div id="view-list" class="view"></div>
  <div id="view-ie" class="view"></div>
`;

beforeEach(() => {
  document.body.innerHTML = FIXTURE;
});

describe("import/export view", () => {
  it("opens with the current JSON", () => {
    openImportExport('{"schemaVersion":2}');
    expect((document.getElementById("json-area") as HTMLTextAreaElement).value).toBe(
      '{"schemaVersion":2}',
    );
  });

  it("loads fetched JSON into the editor", async () => {
    initImportExportView({
      onCancel: vi.fn(),
      onSave: vi.fn(),
      getJson: () => "{}",
      fetchJsonFromUrl: vi.fn().mockResolvedValue('{"rules":[]}'),
      readJsonFile: vi.fn(),
    });

    (document.getElementById("url-input") as HTMLInputElement).value =
      "https://example.com/rules.json";
    document.getElementById("btn-fetch-url")?.click();
    await Promise.resolve();
    await Promise.resolve();
    expect((document.getElementById("json-area") as HTMLTextAreaElement).value).toBe(
      '{"rules":[]}',
    );
  });

  it("imports selected JSON into the editor", async () => {
    const readJsonFile = vi.fn().mockResolvedValue('{"schemaVersion":2}');
    initImportExportView({
      onCancel: vi.fn(),
      onSave: vi.fn(),
      getJson: () => "{}",
      fetchJsonFromUrl: vi.fn(),
      readJsonFile,
    });

    const input = document.getElementById("json-file-input") as HTMLInputElement;
    Object.defineProperty(input, "files", {
      value: [new File(["{}"], "rules.json", { type: "application/json" })],
    });
    input.dispatchEvent(new Event("change"));
    await Promise.resolve();
    await Promise.resolve();

    expect(readJsonFile).toHaveBeenCalled();
    expect((document.getElementById("json-area") as HTMLTextAreaElement).value).toBe(
      '{"schemaVersion":2}',
    );
  });

  it("loads dropped JSON into the editor", async () => {
    const readJsonFile = vi.fn().mockResolvedValue('{"schemaVersion":2}');
    initImportExportView({
      onCancel: vi.fn(),
      onSave: vi.fn(),
      getJson: () => "{}",
      fetchJsonFromUrl: vi.fn(),
      readJsonFile,
    });

    const event = new Event("drop") as DragEvent;
    Object.defineProperty(event, "dataTransfer", {
      value: { files: [new File(["{}"], "rules.json", { type: "application/json" })] },
    });
    document.getElementById("json-dropzone")?.dispatchEvent(event);
    await Promise.resolve();
    await Promise.resolve();

    expect(readJsonFile).toHaveBeenCalled();
    expect((document.getElementById("json-area") as HTMLTextAreaElement).value).toBe(
      '{"schemaVersion":2}',
    );
  });

  it("passes edited JSON to onSave", () => {
    const onSave = vi.fn();
    initImportExportView({
      onCancel: vi.fn(),
      onSave,
      getJson: () => "{}",
      fetchJsonFromUrl: vi.fn(),
      readJsonFile: vi.fn(),
    });
    (document.getElementById("json-area") as HTMLTextAreaElement).value = '{"rules":[]}';
    document.getElementById("btn-save-ie")?.click();
    expect(onSave).toHaveBeenCalledWith('{"rules":[]}');
  });

  it("saves from the header save button too", () => {
    const onSave = vi.fn();
    initImportExportView({
      onCancel: vi.fn(),
      onSave,
      getJson: () => "{}",
      fetchJsonFromUrl: vi.fn(),
      readJsonFile: vi.fn(),
    });
    (document.getElementById("json-area") as HTMLTextAreaElement).value = '{"rules":[]}';
    document.getElementById("btn-save-ie-header")?.click();
    expect(onSave).toHaveBeenCalledWith('{"rules":[]}');
  });

  it("shows errors from async save", async () => {
    initImportExportView({
      onCancel: vi.fn(),
      onSave: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      getJson: () => "{}",
      fetchJsonFromUrl: vi.fn(),
      readJsonFile: vi.fn(),
    });

    document.getElementById("btn-save-ie")?.click();
    await Promise.resolve();
    await Promise.resolve();

    const error = document.getElementById("ie-error") as HTMLElement;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe("Invalid JSON");
  });
});
