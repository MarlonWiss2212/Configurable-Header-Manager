import { describe, expect, it } from "vitest";
import { ToggleFolderCollapseUseCase } from "@/src/domain/usecases/folders/toggle-folder-collapse";
import { ruleState } from "@/tests/fixtures";

const useCase = new ToggleFolderCollapseUseCase();

describe("ToggleFolderCollapseUseCase", () => {
  it("collapses an expanded folder and expands a collapsed one", () => {
    const collapsed = useCase.execute(ruleState(), "staging");
    expect(collapsed.folders[0].collapsed).toBe(true);

    const expanded = useCase.execute(collapsed, "staging");
    expect(expanded.folders[0].collapsed).toBe(false);
  });

  it("only touches the targeted folder's flag, not its rules", () => {
    const next = useCase.execute(ruleState(), "staging");
    expect(next.folders[0].rules).toStrictEqual(ruleState().folders[0].rules);
    expect(next.rules).toStrictEqual(ruleState().rules);
  });

  it("leaves the state unchanged for an unknown folder", () => {
    expect(useCase.execute(ruleState(), "missing")).toStrictEqual(ruleState());
  });

  it("does not mutate the input state", () => {
    const source = ruleState();
    useCase.execute(source, "staging");
    expect(source.folders[0].collapsed).toBeUndefined();
  });
});
