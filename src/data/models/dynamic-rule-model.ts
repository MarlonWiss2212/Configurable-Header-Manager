import type { RuleOperation } from "@/src/domain/entities/rule";

export interface DynamicRuleHeader {
  header: string;
  operation: RuleOperation;
  value?: string;
}

export interface DynamicRule {
  id: number;
  priority: number;
  action: {
    type: "modifyHeaders";
    requestHeaders?: DynamicRuleHeader[];
    responseHeaders?: DynamicRuleHeader[];
  };
  condition: {
    resourceTypes: readonly string[];
    urlFilter?: string;
  };
}
