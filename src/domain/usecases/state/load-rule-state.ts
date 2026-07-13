import type { RuleState } from "@/src/domain/entities/rule";
import type { StateRepository } from "@/src/domain/repositories/state-repository";

export class LoadRuleStateUseCase {
  constructor(private readonly repository: StateRepository) {}

  execute(): Promise<RuleState> {
    return this.repository.loadState();
  }
}
