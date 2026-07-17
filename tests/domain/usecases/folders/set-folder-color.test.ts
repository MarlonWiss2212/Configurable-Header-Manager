import { describe, expect, it } from "vitest";
import { SetFolderColorUseCase } from "@/src/domain/usecases/folders/set-folder-color";
import { ruleState } from "@/tests/fixtures";

const useCase = new SetFolderColorUseCase();

describe("SetFolderColorUseCase", () => {
  it("sets a folder's colour", () => {
    const next = useCase.execute(ruleState(), "staging", "#ff3b30");
    expect(next.folders[0].color).toBe("#ff3b30");
  });

  it("clears the colour when given an empty string", () => {
    const withColor = useCase.execute(ruleState(), "staging", "#ff3b30");
    expect(useCase.execute(withColor, "staging", "").folders[0].color).toBeUndefined();
  });

  it("does not mutate the input state", () => {
    const source = ruleState();
    useCase.execute(source, "staging", "#007aff");
    expect(source.folders[0].color).toBeUndefined();
  });
});
