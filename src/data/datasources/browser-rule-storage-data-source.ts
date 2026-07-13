/** Dumb I/O around browser.storage.local — no migration, no validation. */
import type { RuleState } from "@/src/domain/entities/rule";

const RULE_STATE_KEY = "ruleState";

export class BrowserRuleStorageDataSource {
  async loadRawState(): Promise<unknown> {
    const stored = (await browser.storage.local.get({ [RULE_STATE_KEY]: null })) as Record<
      string,
      unknown
    >;
    return stored[RULE_STATE_KEY];
  }

  async saveState(state: RuleState): Promise<void> {
    await browser.storage.local.set({ [RULE_STATE_KEY]: state });
  }
}
