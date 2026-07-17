import { describe, expect, it } from "vitest";
import type { RuleState } from "@/src/domain/entities/rule";
import { MergeRuleStatesUseCase } from "@/src/domain/usecases/transfer/merge-rule-states";
import { flattenRules } from "@/src/domain/utils/rule-state";
import { rule, ruleState } from "@/tests/fixtures";

const useCase = new MergeRuleStatesUseCase();

function incoming(): RuleState {
  return {
    schemaVersion: 2,
    folders: [{ id: "staging", name: "Staging", rules: [rule({ id: 1 })] }],
    rules: [rule({ id: 2 })],
  };
}

describe("MergeRuleStatesUseCase", () => {
  it("appends incoming rules into an existing folder matched by name", () => {
    // current "Staging" has rules 1+2; incoming "Staging" adds one more
    const next = useCase.execute(ruleState(), incoming());
    expect(next.folders).toHaveLength(1);
    expect(next.folders[0].rules).toHaveLength(3);
  });

  it("appends incoming ungrouped rules", () => {
    const next = useCase.execute(ruleState(), incoming());
    expect(next.rules).toHaveLength(2); // original 1 + incoming 1
  });

  it("reassigns incoming ids so none collide with the current state", () => {
    const next = useCase.execute(ruleState(), incoming());
    const ids = flattenRules(next).map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("adds an unmatched incoming folder with a unique id", () => {
    const other: RuleState = {
      schemaVersion: 2,
      folders: [{ id: "staging", name: "Prod", rules: [rule({ id: 9 })] }],
      rules: [],
    };
    const next = useCase.execute(ruleState(), other);
    expect(next.folders.map((folder) => folder.name)).toEqual(["Staging", "Prod"]);
    expect(new Set(next.folders.map((folder) => folder.id)).size).toBe(2);
  });

  it("preserves colours on merged-in folders and rules", () => {
    const other: RuleState = {
      schemaVersion: 2,
      folders: [{ id: "prod", name: "Prod", color: "#34c759", rules: [rule({ id: 9 })] }],
      rules: [rule({ id: 8, color: "#007aff" })],
    };
    const next = useCase.execute(ruleState(), other);
    expect(next.folders.find((f) => f.name === "Prod")?.color).toBe("#34c759");
    expect(next.rules.find((r) => r.color === "#007aff")).toBeDefined();
  });

  it("does not mutate the current state", () => {
    const current = ruleState();
    useCase.execute(current, incoming());
    expect(flattenRules(current)).toHaveLength(3);
  });
});
