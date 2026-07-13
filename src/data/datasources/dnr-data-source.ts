/** Dumb I/O around browser.declarativeNetRequest — no mapping. */
import type { DynamicRule } from "@/src/data/models/dynamic-rule-model";

export class DnrDataSource {
  async getDynamicRuleIds(): Promise<number[]> {
    const existing = await browser.declarativeNetRequest.getDynamicRules();
    return existing.map((rule: { id: number }) => rule.id);
  }

  async replaceDynamicRules(removeRuleIds: number[], addRules: DynamicRule[]): Promise<void> {
    // oxlint-disable-next-line no-explicit-any -- WXT's polyfill lacks updateDynamicRules typing
    await (browser.declarativeNetRequest as any).updateDynamicRules({ removeRuleIds, addRules });
  }
}
