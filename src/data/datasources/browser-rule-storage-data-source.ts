/** Dumb I/O around browser.storage.local — no migration, no validation. */
import type { RuleState } from "@/src/domain/entities/rule";

const RULE_STATE_KEY = "ruleState";
const GLOBAL_ENABLED_KEY = "globalEnabled";

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

  async loadRawGlobalEnabled(): Promise<unknown> {
    const stored = (await browser.storage.local.get({ [GLOBAL_ENABLED_KEY]: null })) as Record<
      string,
      unknown
    >;
    return stored[GLOBAL_ENABLED_KEY];
  }

  async saveGlobalEnabled(enabled: boolean): Promise<void> {
    await browser.storage.local.set({ [GLOBAL_ENABLED_KEY]: enabled });
  }
}
