// browser + defineBackground are WXT auto-imports
import { applyRulesToDNR } from '@/src/dnr';
import type { Rule } from '@/src/types';

export default defineBackground(async () => {
  browser.runtime.onInstalled.addListener(async () => {
    const result = (await browser.storage.local.get({ rules: [] })) as { rules: Rule[] };
    if (result.rules.length) await applyRulesToDNR(result.rules);
  });
});
