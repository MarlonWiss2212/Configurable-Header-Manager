import { describe, expect, it } from "vitest";
import type { Rule, RuleState } from "@/src/domain/entities/rule";
import {
  cloneRuleState,
  enabledRules,
  findRule,
  flattenRules,
  folderOptions,
  getRuleCollection,
  nextRuleId,
} from "@/src/domain/utils/rule-state";

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
    folders: [{ id: "staging", name: "Staging", rules: [rule({ id: 1 }), rule({ id: 2 })] }],
    rules: [rule({ id: 3, enabled: false })],
  };
}

describe("flattenRules", () => {
  it("flattens rules in folder order, then ungrouped order", () => {
    expect(flattenRules(state()).map((item) => item.id)).toEqual([1, 2, 3]);
  });
});

describe("enabledRules", () => {
  it("returns only enabled rules", () => {
    expect(enabledRules(state()).map((item) => item.id)).toEqual([1, 2]);
  });

  it("skips enabled rules with a blank header name", () => {
    const source = state();
    source.folders[0].rules[0].headerName = "  ";
    expect(enabledRules(source).map((item) => item.id)).toEqual([2]);
  });
});

describe("nextRuleId", () => {
  it("generates the next rule id from the whole tree", () => {
    expect(nextRuleId(state())).toBe(4);
  });

  it("starts at 1 for an empty state", () => {
    expect(nextRuleId({ schemaVersion: 2, folders: [], rules: [] })).toBe(1);
  });
});

describe("findRule", () => {
  it("finds a rule inside a folder with its location", () => {
    expect(findRule(state(), 2)).toMatchObject({ rule: { id: 2 }, folderId: "staging" });
  });

  it("finds an ungrouped rule with a null folder id", () => {
    expect(findRule(state(), 3)).toMatchObject({ rule: { id: 3 }, folderId: null });
  });

  it("returns null for an unknown id", () => {
    expect(findRule(state(), 99)).toBeNull();
  });
});

describe("folderOptions", () => {
  it("lists folder ids and names", () => {
    expect(folderOptions(state())).toEqual([{ id: "staging", name: "Staging" }]);
  });
});

describe("getRuleCollection", () => {
  it("returns the ungrouped rules for null", () => {
    const source = state();
    expect(getRuleCollection(source, null)).toBe(source.rules);
  });

  it("returns the folder rules for a folder id and throws for unknown folders", () => {
    const source = state();
    expect(getRuleCollection(source, "staging")).toBe(source.folders[0].rules);
    expect(() => getRuleCollection(source, "nope")).toThrow("Folder nope not found");
  });
});

describe("cloneRuleState", () => {
  it("deep-clones so mutations do not leak back", () => {
    const source = state();
    const clone = cloneRuleState(source);
    clone.folders[0].rules[0].headerName = "X-Mutated";
    clone.rules.push(rule({ id: 99 }));

    expect(source.folders[0].rules[0].headerName).toBe("X-Test");
    expect(source.rules).toHaveLength(1);
  });
});
