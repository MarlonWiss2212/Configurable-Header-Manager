import type { Rule, RuleState } from "@/src/domain/entities/rule";
import { EMPTY_RULE_STATE } from "@/src/domain/utils/rule-state";
import type { MigrationRepository } from "@/src/domain/repositories/migration-repository";
import type { StateRepository } from "@/src/domain/repositories/state-repository";
import { DataError } from "@/src/data/errors/data-error";
import { DnrRuleMapper } from "@/src/data/mappers/dnr-rule-mapper";
import { RuleStateMapper } from "@/src/data/mappers/rule-state-mapper";
import { BrowserRuleStorageDataSource } from "@/src/data/datasources/browser-rule-storage-data-source";
import { DnrDataSource } from "@/src/data/datasources/dnr-data-source";

export class BrowserStateRepository implements StateRepository {
  private readonly dnrMapper = new DnrRuleMapper();
  private readonly stateMapper = new RuleStateMapper();

  constructor(
    private readonly migration: MigrationRepository,
    private readonly storage = new BrowserRuleStorageDataSource(),
    private readonly dnr = new DnrDataSource(),
  ) {}

  async loadState(): Promise<RuleState> {
    const raw = await this.storage.loadRawState();
    if (raw === null || raw === undefined) return EMPTY_RULE_STATE;
    try {
      return this.migration.migrateToCurrent(raw);
    } catch {
      return EMPTY_RULE_STATE;
    }
  }

  saveState(state: RuleState): Promise<void> {
    return this.storage.saveState(state);
  }

  async applyRules(rules: Rule[]): Promise<void> {
    const removeRuleIds = await this.dnr.getDynamicRuleIds();
    await this.dnr.replaceDynamicRules(
      removeRuleIds,
      rules.map((rule) => this.dnrMapper.toDynamicRule(rule)),
    );
  }

  parseRules(text: string): RuleState {
    if (text.length > 2_000_000) {
      throw new DataError("That JSON is too large to import (max 2 MB).");
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      throw new DataError("Invalid JSON - check the format and try again.");
    }
    return this.migration.migrateToCurrent(parsed);
  }

  serializeRules(state: RuleState): string {
    return JSON.stringify(this.stateMapper.toRuleStateModel(state), null, 2);
  }

  async loadGlobalEnabled(): Promise<boolean> {
    const raw = await this.storage.loadRawGlobalEnabled();
    return raw !== false;
  }

  saveGlobalEnabled(enabled: boolean): Promise<void> {
    return this.storage.saveGlobalEnabled(enabled);
  }
}
