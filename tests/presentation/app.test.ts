import { readFileSync } from "node:fs";
import { fakeBrowser } from "wxt/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RuleState } from "@/src/domain/entities/rule";
import { initApp } from "@/src/presentation/app/app";

// The real popup markup, so the test breaks when app.ts and index.html drift apart.
// Script tags are stripped — happy-dom would try to load ./main.ts and abort the parse.
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
  // fake-browser has no declarativeNetRequest — stub the two calls the app makes
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

  it("persists a rule toggle and re-applies the rules", async () => {
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

  it("persists folder collapse into the rule state", async () => {
    document.querySelector<HTMLElement>(".folder-row")?.click();

    await vi.waitFor(async () => {
      expect((await storedState()).folders[0].collapsed).toBe(true);
      expect(document.querySelector(".folder-row")?.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("adds a new rule through the form", async () => {
    document.getElementById("btn-add")?.click();
    expect(document.getElementById("view-form")?.classList.contains("active")).toBe(true);

    (document.getElementById("f-name") as HTMLInputElement).value = "X-New";
    document.getElementById("btn-save")?.click();

    await vi.waitFor(async () => {
      const stored = await storedState();
      expect(stored.rules.map((rule) => rule.headerName)).toEqual(["X-New"]);
      expect(document.getElementById("view-list")?.classList.contains("active")).toBe(true);
    });
  });

  it("adds a new rule through the form header save button", async () => {
    document.getElementById("btn-add")?.click();
    expect(document.getElementById("view-form")?.classList.contains("active")).toBe(true);

    (document.getElementById("f-name") as HTMLInputElement).value = "X-Header";
    document.getElementById("btn-save-header")?.click();

    await vi.waitFor(async () => {
      const stored = await storedState();
      expect(stored.rules.map((rule) => rule.headerName)).toEqual(["X-Header"]);
      expect(document.getElementById("view-list")?.classList.contains("active")).toBe(true);
    });
  });
});
