import { describe, expect, it } from "vitest";
import { ImportRulesUseCase } from "@/src/domain/usecases/transfer/import-rules";
import { mockStateRepository, ruleState } from "@/tests/fixtures";

describe("ImportRulesUseCase", () => {
  it("parses text through the repository", () => {
    const stored = ruleState();
    const repository = mockStateRepository(stored);

    expect(new ImportRulesUseCase(repository).execute("{...}")).toBe(stored);
    expect(repository.parseRules).toHaveBeenCalledWith("{...}");
  });
});
