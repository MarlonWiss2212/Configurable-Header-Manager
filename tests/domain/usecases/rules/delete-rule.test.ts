import { describe, expect, it } from "vitest";
import { DeleteRuleUseCase } from "@/src/domain/usecases/rules/delete-rule";
import { flattenRules } from "@/src/domain/utils/rule-state";
import { ruleState } from "@/tests/fixtures";

const useCase = new DeleteRuleUseCase();

describe("DeleteRuleUseCase", () => {
  it("deletes a rule from a folder but keeps the folder while it still has rules", () => {
    const next = useCase.execute(ruleState(), 2);
    expect(flattenRules(next).map((item) => item.id)).toEqual([1, 3]);
    expect(next.folders).toHaveLength(1);
  });

  it("deletes an ungrouped rule", () => {
    expect(flattenRules(useCase.execute(ruleState(), 3)).map((item) => item.id)).toEqual([1, 2]);
  });

  it("removes the folder when its last rule is deleted", () => {
    const next = useCase.execute(useCase.execute(ruleState(), 1), 2);
    expect(next.folders).toHaveLength(0);
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
