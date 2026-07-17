import { fakeBrowser } from "wxt/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Rule, RuleState } from "@/src/domain/entities/rule";
import { DataError } from "@/src/data/errors/data-error";
import { DnrDataSource } from "@/src/data/datasources/dnr-data-source";
import { BrowserStateRepository } from "@/src/data/repositories/browser-state-repository";
import { RuleMigrationRepository } from "@/src/data/repositories/rule-migration-repository";

function repository(dnr?: DnrDataSource): BrowserStateRepository {
  return new BrowserStateRepository(new RuleMigrationRepository(), undefined, dnr);
}

function rule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: 1,
    enabled: true,
    urlPattern: "*",
    type: "request",
    operation: "set",
    headerName: "X-Test",
    headerValue: "1",
    ...overrides,
  };
}

function state(): RuleState {
  return {
    schemaVersion: 2,
    folders: [{ id: "staging", name: "Staging", rules: [rule({ id: 1 })], collapsed: true }],
    rules: [rule({ id: 2, enabled: false })],
  };
}

beforeEach(() => {
  fakeBrowser.reset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadState / saveState", () => {
  it("round-trips the state including the collapsed flag", async () => {
    const repo = repository();
    await repo.saveState(state());
    expect(await repo.loadState()).toEqual(state());
  });

  it("returns an empty state when storage is empty or corrupt", async () => {
    expect(await repository().loadState()).toEqual({
      schemaVersion: 2,
      folders: [],
      rules: [],
    });

    await browser.storage.local.set({ ruleState: { schemaVersion: 99 } });
    expect(await repository().loadState()).toEqual({
      schemaVersion: 2,
      folders: [],
      rules: [],
    });
  });
});

describe("parseRules / serializeRules", () => {
  it("round-trips through the JSON exchange format", () => {
    const repo = repository();
    expect(repo.parseRules(repo.serializeRules(state()))).toEqual(state());
  });

  it("throws a user-facing error for malformed JSON", () => {
    expect(() => repository().parseRules("{nope")).toThrow(DataError);
    expect(() => repository().parseRules("{nope")).toThrow("Invalid JSON");
  });

  it("round-trips rule and folder colours", () => {
    const repo = repository();
    const colored: RuleState = {
      schemaVersion: 2,
      folders: [{ id: "staging", name: "Staging", color: "#ff3b30", rules: [rule({ id: 1 })] }],
      rules: [rule({ id: 2, color: "#007aff" })],
    };
    const restored = repo.parseRules(repo.serializeRules(colored));
    expect(restored.folders[0].color).toBe("#ff3b30");
    expect(restored.rules[0].color).toBe("#007aff");
  });
});

describe("global enabled", () => {
  it("defaults to enabled when nothing is stored", async () => {
    expect(await repository().loadGlobalEnabled()).toBe(true);
  });

  it("round-trips the flag and treats only an explicit false as disabled", async () => {
    const repo = repository();
    await repo.saveGlobalEnabled(false);
    expect(await repo.loadGlobalEnabled()).toBe(false);

    await repo.saveGlobalEnabled(true);
    expect(await repo.loadGlobalEnabled()).toBe(true);
  });
});

describe("applyRules", () => {
  it("replaces existing dynamic rules with the mapped given rules", async () => {
    const dnr = {
      getDynamicRuleIds: vi.fn().mockResolvedValue([7, 8]),
      replaceDynamicRules: vi.fn().mockResolvedValue(undefined),
    } as unknown as DnrDataSource;

    await repository(dnr).applyRules([
      rule({ id: 1, urlPattern: "example.com" }),
      rule({ id: 2, operation: "remove", type: "response" }),
    ]);

    const [removeIds, addRules] = vi.mocked(dnr.replaceDynamicRules).mock.calls[0];
    expect(removeIds).toEqual([7, 8]);
    expect(addRules[0]).toMatchObject({
      id: 1,
      action: { requestHeaders: [{ header: "X-Test", operation: "set", value: "1" }] },
      condition: { urlFilter: "||example.com^" },
    });
    expect(addRules[1].action.responseHeaders?.[0]).toEqual({
      header: "X-Test",
      operation: "remove",
    });
  });
});
