import type { RuleState } from "@/src/domain/entities/rule";
import type { StateRepository } from "@/src/domain/repositories/state-repository";

/** Serializes the rule state to its JSON exchange format */
export class ExportRulesUseCase {
  constructor(private readonly repository: StateRepository) {}

  execute(state: RuleState): string {
    return this.repository.serializeRules(state);
  }
}
