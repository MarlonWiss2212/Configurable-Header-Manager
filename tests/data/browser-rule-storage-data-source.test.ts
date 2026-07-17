import { fakeBrowser } from "wxt/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { BrowserRuleStorageDataSource } from "@/src/data/datasources/browser-rule-storage-data-source";

beforeEach(() => {
  fakeBrowser.reset();
});

describe("BrowserRuleStorageDataSource", () => {
  it("returns null when nothing is stored", async () => {
    expect(await new BrowserRuleStorageDataSource().loadRawState()).toBeNull();
  });

  it("returns the stored value verbatim — no validation, no migration", async () => {
    await browser.storage.local.set({ ruleState: { anything: "goes" } });
    expect(await new BrowserRuleStorageDataSource().loadRawState()).toEqual({ anything: "goes" });
  });

  it("round-trips through saveState", async () => {
    const dataSource = new BrowserRuleStorageDataSource();
    const state = { schemaVersion: 2 as const, folders: [], rules: [] };

    await dataSource.saveState(state);
    expect(await dataSource.loadRawState()).toEqual(state);
  });

  it("returns null for global-enabled when nothing is stored", async () => {
    expect(await new BrowserRuleStorageDataSource().loadRawGlobalEnabled()).toBeNull();
  });

  it("round-trips the global-enabled flag", async () => {
    const dataSource = new BrowserRuleStorageDataSource();
    await dataSource.saveGlobalEnabled(false);
    expect(await dataSource.loadRawGlobalEnabled()).toBe(false);
  });
});
