import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  initFolderColorDialog,
  openFolderColorDialog,
} from "@/src/presentation/views/folder-color-dialog";

const FIXTURE = `
  <div id="folder-color-dialog" hidden>
    <div id="folder-color-swatches"></div>
    <button id="folder-color-cancel"></button>
  </div>
`;

beforeEach(() => {
  document.body.innerHTML = FIXTURE;
  initFolderColorDialog();
});

describe("folder colour dialog", () => {
  it("renders a none swatch plus the palette", () => {
    expect(document.querySelectorAll(".dialog-swatch").length).toBeGreaterThan(1);
    expect(document.querySelector(".dialog-swatch.swatch-none")).not.toBeNull();
  });

  it("opens, marks the current colour selected, and picks a colour", () => {
    const pick = vi.fn();
    openFolderColorDialog("#ff3b30", pick);
    expect(document.getElementById("folder-color-dialog")?.hidden).toBe(false);
    expect(
      document
        .querySelector<HTMLButtonElement>('.dialog-swatch[data-color="#ff3b30"]')
        ?.classList.contains("is-selected"),
    ).toBe(true);

    document.querySelector<HTMLButtonElement>('.dialog-swatch[data-color="#34c759"]')?.click();
    expect(pick).toHaveBeenCalledWith("#34c759");
    expect(document.getElementById("folder-color-dialog")?.hidden).toBe(true);
  });

  it("clears the colour via the none swatch", () => {
    const pick = vi.fn();
    openFolderColorDialog("#ff3b30", pick);
    document.querySelector<HTMLButtonElement>(".dialog-swatch.swatch-none")?.click();
    expect(pick).toHaveBeenCalledWith("");
  });

  it("cancel closes without picking", () => {
    const pick = vi.fn();
    openFolderColorDialog("", pick);
    document.getElementById("folder-color-cancel")?.click();
    expect(pick).not.toHaveBeenCalled();
    expect(document.getElementById("folder-color-dialog")?.hidden).toBe(true);
  });
});
