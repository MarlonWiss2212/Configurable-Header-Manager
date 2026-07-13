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
    expect(await repository().loadState()).toEqual({ schemaVersion: 2, folders: [], rules: [] });

    await browser.storage.local.set({ ruleState: { schemaVersion: 99 } });
    expect(await repository().loadState()).toEqual({ schemaVersion: 2, folders: [], rules: [] });
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
});

describe("fetchRules", () => {
  it("rejects malformed URLs and unsupported protocols without fetching", async () => {
    await expect(repository().fetchRules("not a url")).rejects.toThrow("Invalid URL");
    await expect(repository().fetchRules("ftp://x.test/rules.json")).rejects.toThrow(
      "Only http:// and https://",
    );
  });

  it("fetches and migrates a hosted rules file", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ schemaVersion: 2, folders: [], rules: [{ headerName: "X-R" }] }),
      }),
    );
    const fetched = await repository().fetchRules("https://x.test/rules.json");
    expect(fetched.rules[0].headerName).toBe("X-R");
  });

  it("throws on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: "Not Found" }),
    );
    await expect(repository().fetchRules("https://x.test/rules.json")).rejects.toThrow("404");
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
