import { describe, expect, it } from "vitest";
import { ExportRulesUseCase } from "@/src/domain/usecases/transfer/export-rules";
import { mockStateRepository, ruleState } from "@/tests/fixtures";

describe("ExportRulesUseCase", () => {
  it("serializes the state through the repository", () => {
    const stored = ruleState();
    const repository = mockStateRepository(stored);

    expect(new ExportRulesUseCase(repository).execute(stored)).toBe("{json}");
    expect(repository.serializeRules).toHaveBeenCalledWith(stored);
  });
});
