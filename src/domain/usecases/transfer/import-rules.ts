import type { RuleState } from "@/src/domain/entities/rule";
import type { StateRepository } from "@/src/domain/repositories/state-repository";

/** Parses rules JSON text into a validated rule state. Throws on invalid input. */
export class ImportRulesUseCase {
  constructor(private readonly repository: StateRepository) {}

  execute(text: string): RuleState {
    return this.repository.parseRules(text);
  }
}
