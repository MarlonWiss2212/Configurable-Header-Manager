import { RULE_STATE_SCHEMA_VERSION, type RuleState } from "@/src/domain/entities/rule";
import type { MigrationRepository } from "@/src/domain/repositories/migration-repository";
import { DataError } from "@/src/data/errors/data-error";
import { RuleStateMapper, isRecord } from "@/src/data/mappers/rule-state-mapper";
import type { RuleStateModel } from "@/src/data/models/rule-state-model";

export class RuleMigrationRepository implements MigrationRepository {
  private readonly mapper = new RuleStateMapper();

  migrateToCurrent(data: unknown): RuleState {
    if (!isRecord(data) || data.schemaVersion === undefined) {
      throw new DataError('Expected rule JSON with a "schemaVersion" field.');
    }
    if (data.schemaVersion !== RULE_STATE_SCHEMA_VERSION) {
      throw new DataError(`Unsupported rule schema version: ${String(data.schemaVersion)}.`);
    }
    return this.mapper.toRuleState(data as unknown as RuleStateModel);
  }
}
