import { describe, expect, it } from "vitest";
import { DuplicateRuleUseCase } from "@/src/domain/usecases/rules/duplicate-rule";
import { flattenRules } from "@/src/domain/utils/rule-state";
import { ruleState } from "@/tests/fixtures";

const useCase = new DuplicateRuleUseCase();

describe("DuplicateRuleUseCase", () => {
  it("inserts a copy with a fresh id directly after the original in its folder", () => {
    const next = useCase.execute(ruleState(), 1);
    const folderIds = next.folders[0].rules.map((item) => item.id);
    expect(folderIds).toEqual([1, 4, 2]); // copy (id 4) sits right after rule 1
    expect(next.folders[0].rules[1]).toMatchObject({ headerName: "X-Test" });
  });

  it("duplicates an ungrouped rule after the original", () => {
    const next = useCase.execute(ruleState(), 3);
    expect(next.rules.map((item) => item.id)).toEqual([3, 4]);
    expect(next.rules[1].enabled).toBe(false); // copies the disabled state
  });

  it("leaves the state unchanged for an unknown id", () => {
    expect(useCase.execute(ruleState(), 99)).toStrictEqual(ruleState());
  });

  it("does not mutate the input state", () => {
    const source = ruleState();
    useCase.execute(source, 1);
    expect(flattenRules(source)).toHaveLength(3);
  });
});
