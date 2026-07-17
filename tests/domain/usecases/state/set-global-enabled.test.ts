import { describe, expect, it } from "vitest";
import { SetGlobalEnabledUseCase } from "@/src/domain/usecases/state/set-global-enabled";
import { mockStateRepository, ruleState } from "@/tests/fixtures";

describe("SetGlobalEnabledUseCase", () => {
  it("persists the flag", async () => {
    const repository = mockStateRepository(ruleState());
    await new SetGlobalEnabledUseCase(repository).execute(false);
    expect(repository.saveGlobalEnabled).toHaveBeenCalledWith(false);
  });
});
