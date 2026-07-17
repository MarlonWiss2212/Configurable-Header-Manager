/** Shared test fixtures — imported by the per-use-case test files. */
import { vi } from "vitest";
import type { Rule, RuleState } from "@/src/domain/entities/rule";
import type { StateRepository } from "@/src/domain/repositories/state-repository";

export function rule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: 1,
    enabled: true,
    urlPattern: "*",
    type: "request",
    operation: "set",
    headerName: "X-Test",
    headerValue: "1",
    ...overrides,
  };
}

/** Folder "staging" with rules 1+2 (enabled), ungrouped rule 3 (disabled) */
export function ruleState(): RuleState {
  return {
    schemaVersion: 2,
    folders: [{ id: "staging", name: "Staging", rules: [rule({ id: 1 }), rule({ id: 2 })] }],
    rules: [rule({ id: 3, enabled: false })],
  };
}

export function mockStateRepository(stored: RuleState): StateRepository {
  return {
    loadState: vi.fn().mockResolvedValue(stored),
    saveState: vi.fn().mockResolvedValue(undefined),
    applyRules: vi.fn().mockResolvedValue(undefined),
    parseRules: vi.fn().mockReturnValue(stored),
    serializeRules: vi.fn().mockReturnValue("{json}"),
    loadGlobalEnabled: vi.fn().mockResolvedValue(true),
    saveGlobalEnabled: vi.fn().mockResolvedValue(undefined),
  };
}
