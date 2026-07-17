import type { StateRepository } from "@/src/domain/repositories/state-repository";

/** Loads whether the extension is globally enabled */
export class LoadGlobalEnabledUseCase {
  constructor(private readonly repository: StateRepository) {}

  execute(): Promise<boolean> {
    return this.repository.loadGlobalEnabled();
  }
}
