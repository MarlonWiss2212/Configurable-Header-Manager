import { describe, expect, it } from "vitest";
import { ToggleFolderUseCase } from "@/src/domain/usecases/folders/toggle-folder";
import { ruleState } from "@/tests/fixtures";

const useCase = new ToggleFolderUseCase();

describe("ToggleFolderUseCase", () => {
  it("toggles every rule in the folder", () => {
    const next = useCase.execute(ruleState(), "staging", false);
    expect(next.folders[0].rules.map((item) => item.enabled)).toEqual([false, false]);
  });

  it("leaves rules outside the folder untouched", () => {
    const next = useCase.execute(ruleState(), "staging", false);
    expect(next.rules[0].enabled).toBe(false); // ungrouped rule was already disabled
  });

  it("leaves the state unchanged for an unknown folder", () => {
    expect(useCase.execute(ruleState(), "missing", false)).toStrictEqual(ruleState());
  });

  it("does not mutate the input state", () => {
    const source = ruleState();
    useCase.execute(source, "staging", false);
    expect(source.folders[0].rules[0].enabled).toBe(true);
  });
});
