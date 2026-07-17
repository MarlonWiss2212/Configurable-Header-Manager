import { describe, expect, it } from "vitest";
import { LoadGlobalEnabledUseCase } from "@/src/domain/usecases/state/load-global-enabled";
import { mockStateRepository, ruleState } from "@/tests/fixtures";

describe("LoadGlobalEnabledUseCase", () => {
  it("returns the repository's global-enabled flag", async () => {
    const repository = mockStateRepository(ruleState());
    expect(await new LoadGlobalEnabledUseCase(repository).execute()).toBe(true);
  });
});
