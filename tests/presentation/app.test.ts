import { readFileSync } from "node:fs";
import { fakeBrowser } from "wxt/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RuleState } from "@/src/domain/entities/rule";
import { initApp } from "@/src/presentation/app/app";

// The real popup markup, so the test breaks when app.ts and index.html drift apart.
const POPUP_BODY = (
  readFileSync("entrypoints/popup/index.html", "utf8").match(/<body>([\s\S]*)<\/body>/)?.[1] ?? ""
).replace(/<script[\s\S]*?<\/script>/g, "");

const seededState: RuleState = {
  schemaVersion: 2,
  folders: [
    {
      id: "staging",
      name: "Staging",
      rules: [
        {
          id: 1,
          enabled: true,
          urlPattern: "*",
          type: "request",
          operation: "set",
          headerName: "X-Seeded",
          headerValue: "1",
        },
      ],
    },
  ],
  rules: [],
};

async function storedState(): Promise<RuleState> {
  const stored = (await browser.storage.local.get("ruleState")) as { ruleState: RuleState };
  return stored.ruleState;
}

beforeEach(async () => {
  fakeBrowser.reset();
  document.body.innerHTML = POPUP_BODY;
  // fake-browser has no declarativeNetRequest — stub the two calls the app makes.
  // oxlint-disable-next-line no-explicit-any
  (fakeBrowser as any).declarativeNetRequest = {
    getDynamicRules: vi.fn().mockResolvedValue([]),
    updateDynamicRules: vi.fn().mockResolvedValue(undefined),
  };
  await browser.storage.local.set({ ruleState: seededState });
  await initApp();
});

describe("popup app (composition root)", () => {
  it("renders the seeded state", () => {
    expect(document.querySelector(".folder-name")?.textContent).toBe("Staging");
    expect(document.querySelector(".rule-name")?.textContent).toBe("X-Seeded");
    expect(document.getElementById("rule-count")?.textContent).toBe("1 of 1 active");
  });

  it("persists a rule toggle and re-applies the DNR rules", async () => {
    const toggle = document.querySelector<HTMLInputElement>(".rule-toggle");
    if (!toggle) throw new Error("rule toggle not rendered");
    toggle.checked = false;
    toggle.dispatchEvent(new Event("change"));

    await vi.waitFor(async () => {
      expect((await storedState()).folders[0].rules[0].enabled).toBe(false);
      // oxlint-disable-next-line no-explicit-any
      expect((fakeBrowser as any).declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
    });
  });

  it("persists folder collapse", async () => {
    document.querySelector<HTMLElement>(".folder-row")?.click();
    await vi.waitFor(async () => {
      expect((await storedState()).folders[0].collapsed).toBe(true);
    });
  });

  it("adds a new rule through the form", async () => {
    document.getElementById("btn-add")?.click();
    (document.getElementById("f-name") as HTMLInputElement).value = "X-New";
    document.getElementById("btn-save")?.click();

    await vi.waitFor(async () => {
      expect((await storedState()).rules.map((rule) => rule.headerName)).toEqual(["X-New"]);
      expect(document.getElementById("view-list")?.classList.contains("active")).toBe(true);
    });
  });

  it("sets a folder colour through the colour dialog", async () => {
    document.querySelector<HTMLButtonElement>(".folder-color-btn")?.click();
    expect(document.getElementById("folder-color-dialog")?.hidden).toBe(false);
    document.querySelector<HTMLButtonElement>('.dialog-swatch[data-color="#34c759"]')?.click();

    await vi.waitFor(async () => {
      expect((await storedState()).folders[0].color).toBe("#34c759");
    });
    expect(document.getElementById("folder-color-dialog")?.hidden).toBe(true);
  });

  it("merges a pasted full-schema document into the current rules", async () => {
    document.getElementById("btn-ie")?.click();
    (document.getElementById("json-area") as HTMLTextAreaElement).value = JSON.stringify({
      schemaVersion: 2,
      folders: [],
      rules: [{ headerName: "X-Pasted", type: "request", operation: "set", headerValue: "1" }],
    });
    (document.getElementById("im-merge") as HTMLInputElement).checked = true;
    document.getElementById("btn-save-ie")?.click();

    await vi.waitFor(async () => {
      const stored = await storedState();
      expect(stored.folders[0].name).toBe("Staging"); // kept
      expect(stored.rules.map((rule) => rule.headerName)).toEqual(["X-Pasted"]); // added
      expect(document.getElementById("view-list")?.classList.contains("active")).toBe(true);
    });
  });

  it("replaces all rules from a pasted document when Replace is chosen", async () => {
    document.getElementById("btn-ie")?.click();
    (document.getElementById("json-area") as HTMLTextAreaElement).value = JSON.stringify({
      schemaVersion: 2,
      folders: [],
      rules: [{ headerName: "X-Fresh", type: "request", operation: "set", headerValue: "1" }],
    });
    (document.getElementById("im-replace") as HTMLInputElement).checked = true;
    document.getElementById("btn-save-ie")?.click();

    await vi.waitFor(async () => {
      const stored = await storedState();
      expect(stored.folders).toEqual([]);
      expect(stored.rules.map((rule) => rule.headerName)).toEqual(["X-Fresh"]);
    });
  });
});
