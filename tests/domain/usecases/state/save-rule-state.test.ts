import { describe, expect, it } from "vitest";
import { SaveRuleStateUseCase } from "@/src/domain/usecases/state/save-rule-state";
import { mockStateRepository, ruleState } from "@/tests/fixtures";

describe("SaveRuleStateUseCase", () => {
  it("persists without touching the network layer (display-only changes)", async () => {
    const stored = ruleState();
    const repository = mockStateRepository(stored);

    await new SaveRuleStateUseCase(repository).execute(stored);

    expect(repository.saveState).toHaveBeenCalledWith(stored);
    expect(repository.applyRules).not.toHaveBeenCalled();
  });
});
