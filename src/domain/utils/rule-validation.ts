import {
  RULE_OPERATIONS,
  RULE_TYPES,
  type Rule,
  type RuleOperation,
  type RuleType,
} from "@/src/domain/entities/rule";

export function isRuleType(value: unknown): value is RuleType {
  return typeof value === "string" && (RULE_TYPES as readonly string[]).includes(value);
}

export function isRuleOperation(value: unknown): value is RuleOperation {
  return typeof value === "string" && (RULE_OPERATIONS as readonly string[]).includes(value);
}

export function optionalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim() || undefined;
}

export function normalizeRule(rule: Rule): Rule {
  return {
    id: rule.id,
    enabled: rule.enabled,
    urlPattern: rule.urlPattern.trim() || "*",
    type: rule.type,
    operation: rule.operation,
    headerName: rule.headerName.trim(),
    headerValue: rule.operation === "remove" ? "" : rule.headerValue.trim(),
    name: optionalText(rule.name),
    comment: optionalText(rule.comment),
    color: optionalText(rule.color),
  };
}
