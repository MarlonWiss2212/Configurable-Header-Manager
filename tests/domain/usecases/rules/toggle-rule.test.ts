import { describe, expect, it } from "vitest";
import { ToggleRuleUseCase } from "@/src/domain/usecases/rules/toggle-rule";
import { ruleState } from "@/tests/fixtures";

const useCase = new ToggleRuleUseCase();

describe("ToggleRuleUseCase", () => {
  it("toggles an ungrouped rule", () => {
    expect(useCase.execute(ruleState(), 3, true).rules[0].enabled).toBe(true);
  });

  it("toggles a rule inside a folder", () => {
    expect(useCase.execute(ruleState(), 1, false).folders[0].rules[0].enabled).toBe(false);
  });

  it("leaves other rules untouched", () => {
    const next = useCase.execute(ruleState(), 1, false);
    expect(next.folders[0].rules[1].enabled).toBe(true);
    expect(next.rules[0].enabled).toBe(false); // was already disabled
  });

  it("leaves the state unchanged for an unknown id", () => {
    expect(useCase.execute(ruleState(), 99, true)).toStrictEqual(ruleState());
  });

  it("does not mutate the input state", () => {
    const source = ruleState();
    useCase.execute(source, 3, true);
    expect(source.rules[0].enabled).toBe(false);
  });
});
