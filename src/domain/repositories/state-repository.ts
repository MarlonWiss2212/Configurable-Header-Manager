import type { Rule, RuleState } from "@/src/domain/entities/rule";

/** All I/O the app needs, in one contract. Implemented in data/. */
export interface StateRepository {
  /** Load the stored state, migrated to the current schema. Corrupt/missing → empty state. */
  loadState(): Promise<RuleState>;
  saveState(state: RuleState): Promise<void>;
  /** Push the given rules to the browser's network layer (declarativeNetRequest). */
  applyRules(rules: Rule[]): Promise<void>;
  /** Parse rules JSON text for import. Throws a user-facing Error on invalid input. */
  parseRules(text: string): RuleState;
  /** Serialize the state to its JSON exchange format for export. */
  serializeRules(state: RuleState): string;
  /** Fetch and parse a hosted rules file. */
  fetchRules(url: string): Promise<RuleState>;
}
