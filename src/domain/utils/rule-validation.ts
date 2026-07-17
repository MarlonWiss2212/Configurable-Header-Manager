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

const HEADER_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
// oxlint-disable-next-line no-control-regex -- intentionally matching control chars to reject them
const HEADER_VALUE_CONTROL = /[\x00-\x1f\x7f]/;

/** RFC 7230 token — a header name may only contain these characters. */
export function isValidHeaderName(name: string): boolean {
  return HEADER_NAME.test(name);
}

/** A header value may not contain control characters (notably CR/LF, which would let a
 *  crafted value inject additional headers). Empty is allowed (e.g. the `remove` operation). */
export function isValidHeaderValue(value: string): boolean {
  return !HEADER_VALUE_CONTROL.test(value);
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
