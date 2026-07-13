import { describe, expect, it } from "vitest";
import type { RuleState } from "@/src/domain/entities/rule";
import { MoveFolderUseCase } from "@/src/domain/usecases/folders/move-folder";

const useCase = new MoveFolderUseCase();

function source(): RuleState {
  return {
    schemaVersion: 2,
    folders: [
      { id: "a", name: "A", rules: [] },
      { id: "b", name: "B", rules: [] },
    ],
    rules: [],
  };
}

describe("MoveFolderUseCase", () => {
  it("moves a folder up", () => {
    expect(useCase.execute(source(), "b", "up").folders.map((folder) => folder.id)).toEqual([
      "b",
      "a",
    ]);
  });

  it("moves a folder down", () => {
    expect(useCase.execute(source(), "a", "down").folders.map((folder) => folder.id)).toEqual([
      "b",
      "a",
    ]);
  });

  it("returns the same state when the move is out of bounds", () => {
    const unchanged = source();
    expect(useCase.execute(unchanged, "a", "up")).toBe(unchanged);
    expect(useCase.execute(unchanged, "b", "down")).toBe(unchanged);
  });

  it("returns the same state for an unknown folder", () => {
    const unchanged = source();
    expect(useCase.execute(unchanged, "missing", "up")).toBe(unchanged);
  });
});
