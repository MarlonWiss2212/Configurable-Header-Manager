import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImportExportHandlers } from "@/src/presentation/types/view-contracts";
import { initImportExportView, openImportExport } from "@/src/presentation/views/import-export";

const FIXTURE = `
  <button id="btn-back-ie"></button>
  <input type="radio" name="import-mode" id="im-merge" value="merge" checked>
  <input type="radio" name="import-mode" id="im-replace" value="replace">
  <label id="json-dropzone" for="json-file-input" tabindex="0"><span>Import from JSON</span></label>
  <input id="json-file-input" type="file">
  <textarea id="json-area"></textarea>
  <button id="btn-download"></button>
  <button id="btn-save-ie"></button>
  <div id="ie-error" hidden></div>
  <div id="view-list" class="view"></div>
  <div id="view-ie" class="view"></div>
`;

function handlers(overrides: Partial<ImportExportHandlers> = {}): ImportExportHandlers {
  return {
    onCancel: vi.fn(),
    onSave: vi.fn(),
    getJson: () => "{}",
    readJsonFile: vi.fn(),
    ...overrides,
  };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  document.body.innerHTML = FIXTURE;
});

describe("import/export view", () => {
  it("starts empty in Merge mode and shows the full config when switched to Replace", () => {
    initImportExportView(handlers());
    openImportExport('{"schemaVersion":2}');
    const editor = document.getElementById("json-area") as HTMLTextAreaElement;
    expect(editor.value).toBe(""); // Merge is the default → empty, ready to paste

    (document.getElementById("im-merge") as HTMLInputElement).checked = false;
    const replace = document.getElementById("im-replace") as HTMLInputElement;
    replace.checked = true;
    replace.dispatchEvent(new Event("change"));
    expect(editor.value).toBe('{"schemaVersion":2}');
  });

  it("loads a chosen JSON file into the editor", async () => {
    const readJsonFile = vi.fn().mockResolvedValue('{"schemaVersion":2}');
    initImportExportView(handlers({ readJsonFile }));

    const input = document.getElementById("json-file-input") as HTMLInputElement;
    Object.defineProperty(input, "files", {
      value: [new File(["{}"], "rules.json", { type: "application/json" })],
    });
    input.dispatchEvent(new Event("change"));
    await flush();

    expect(readJsonFile).toHaveBeenCalled();
    expect((document.getElementById("json-area") as HTMLTextAreaElement).value).toBe(
      '{"schemaVersion":2}',
    );
  });

  it("imports with the default mode (merge)", () => {
    const onSave = vi.fn();
    initImportExportView(handlers({ onSave }));
    (document.getElementById("json-area") as HTMLTextAreaElement).value = '{"rules":[]}';
    document.getElementById("btn-save-ie")?.click();
    expect(onSave).toHaveBeenCalledWith('{"rules":[]}', "merge");
  });

  it("imports with replace when selected", () => {
    const onSave = vi.fn();
    initImportExportView(handlers({ onSave }));
    (document.getElementById("json-area") as HTMLTextAreaElement).value = '{"rules":[]}';
    (document.getElementById("im-replace") as HTMLInputElement).checked = true;
    document.getElementById("btn-save-ie")?.click();
    expect(onSave).toHaveBeenCalledWith('{"rules":[]}', "replace");
  });

  it("shows errors from an async save", async () => {
    initImportExportView(
      handlers({ onSave: vi.fn().mockRejectedValue(new Error("Invalid JSON")) }),
    );
    document.getElementById("btn-save-ie")?.click();
    await flush();
    const error = document.getElementById("ie-error") as HTMLElement;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe("Invalid JSON");
  });
});
