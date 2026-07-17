import { describe, expect, it } from "vitest";
import { removeRuleFromCollections } from "@/src/domain/usecases/utils/remove-rule";
import { flattenRules } from "@/src/domain/utils/rule-state";
import { ruleState } from "@/tests/fixtures";

describe("removeRuleFromCollections", () => {
  it("removes a rule from a folder", () => {
    const next = removeRuleFromCollections(ruleState(), 1);
    expect(flattenRules(next).map((r) => r.id)).toEqual([2, 3]);
  });

  it("removes an ungrouped rule", () => {
    const next = removeRuleFromCollections(ruleState(), 3);
    expect(flattenRules(next).map((r) => r.id)).toEqual([1, 2]);
  });

  it("leaves the state unchanged for an unknown id", () => {
    expect(flattenRules(removeRuleFromCollections(ruleState(), 99)).map((r) => r.id)).toEqual([
      1, 2, 3,
    ]);
  });
});
