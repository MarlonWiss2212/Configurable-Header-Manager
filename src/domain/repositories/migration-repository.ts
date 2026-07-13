import type { RuleState } from "@/src/domain/entities/rule";

/** Turns raw stored/imported data into the current rule state schema. Implemented in data/. */
export interface MigrationRepository {
  /** Validate + parse raw data as the current schema. Throws on anything else. */
  migrateToCurrent(data: unknown): RuleState;
}
