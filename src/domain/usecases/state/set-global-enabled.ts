import type { StateRepository } from "@/src/domain/repositories/state-repository";

/** Persists the global on/off flag. The DNR re-apply happens via the background sync. */
export class SetGlobalEnabledUseCase {
  constructor(private readonly repository: StateRepository) {}

  execute(enabled: boolean): Promise<void> {
    return this.repository.saveGlobalEnabled(enabled);
  }
}
