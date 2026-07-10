import type { Rule } from './types';

function isValidRule(r: unknown): r is Rule {
  if (!r || typeof r !== 'object') return false;
  const rule = r as Record<string, unknown>;
  return (
    typeof rule.id === 'number' &&
    typeof rule.enabled === 'boolean' &&
    typeof rule.headerName === 'string' &&
    rule.headerName.trim().length > 0
  );
}

export async function loadRules(): Promise<Rule[]> {
  const result = (await browser.storage.local.get({ rules: [] })) as { rules: unknown[] };
  if (!Array.isArray(result.rules)) return [];
  return result.rules.filter(isValidRule);
}

export async function persistRules(rules: Rule[]): Promise<void> {
  await browser.storage.local.set({ rules });
}
