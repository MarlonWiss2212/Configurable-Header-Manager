import { describe, expect, it } from "vitest";
import type { RuleState } from "@/src/domain/entities/rule";
import { MoveRuleUseCase } from "@/src/domain/usecases/rules/move-rule";
import { rule, ruleState } from "@/tests/fixtures";

const useCase = new MoveRuleUseCase();

function source(): RuleState {
  return {
    schemaVersion: 2,
    folders: [{ id: "a", name: "A", rules: [rule({ id: 1 }), rule({ id: 2 })] }],
    rules: [rule({ id: 3 }), rule({ id: 4 })],
  };
}

describe("MoveRuleUseCase", () => {
  it("moves a rule up inside its folder", () => {
    expect(useCase.execute(source(), "a", 2, "up").folders[0].rules.map((item) => item.id)).toEqual(
      [2, 1],
    );
  });

  it("moves an ungrouped rule down", () => {
    expect(useCase.execute(source(), null, 3, "down").rules.map((item) => item.id)).toEqual([4, 3]);
  });

  it("never moves a rule across container boundaries", () => {
    const next = useCase.execute(source(), "a", 2, "down"); // last in folder
    expect(next.folders[0].rules.map((item) => item.id)).toEqual([1, 2]);
    expect(next.rules.map((item) => item.id)).toEqual([3, 4]);
  });

  it("leaves the state unchanged when the move is out of bounds", () => {
    expect(useCase.execute(ruleState(), "staging", 1, "up")).toStrictEqual(ruleState());
    const unchanged = source();
    expect(useCase.execute(unchanged, null, 3, "up")).toBe(unchanged);
  });

  it("leaves the state unchanged for an unknown rule id", () => {
    expect(useCase.execute(source(), "a", 99, "up")).toStrictEqual(source());
  });
});
