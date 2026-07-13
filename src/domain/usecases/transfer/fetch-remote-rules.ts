import type { RuleState } from "@/src/domain/entities/rule";
import type { StateRepository } from "@/src/domain/repositories/state-repository";

/** Loads a rule state from a hosted rules file */
export class FetchRemoteRulesUseCase {
  constructor(private readonly repository: StateRepository) {}

  execute(url: string): Promise<RuleState> {
    return this.repository.fetchRules(url);
  }
}
