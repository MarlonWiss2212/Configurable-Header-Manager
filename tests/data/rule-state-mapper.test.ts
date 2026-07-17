import { describe, expect, it } from "vitest";
import type { RuleState } from "@/src/domain/entities/rule";
import { RuleStateMapper } from "@/src/data/mappers/rule-state-mapper";
import type { RuleStateModel } from "@/src/data/models/rule-state-model";

const mapper = new RuleStateMapper();

describe("RuleStateMapper", () => {
  it("round-trips folders, rules and colours (entity → model → entity)", () => {
    const state: RuleState = {
      schemaVersion: 2,
      folders: [
        {
          id: "staging",
          name: "Staging",
          color: "#ff3b30",
          collapsed: true,
          rules: [
            {
              id: 1,
              enabled: true,
              urlPattern: "*",
              type: "request",
              operation: "set",
              headerName: "X-A",
              headerValue: "1",
              color: "#007aff",
            },
          ],
        },
      ],
      rules: [],
    };

    const restored = mapper.toRuleState(mapper.toRuleStateModel(state) as RuleStateModel);
    expect(restored.folders[0]).toMatchObject({ color: "#ff3b30", collapsed: true });
    expect(restored.folders[0].rules[0].color).toBe("#007aff");
  });

  it("drops rules with an invalid header name or value on import", () => {
    const model: RuleStateModel = {
      schemaVersion: 2,
      folders: [],
      rules: [
        { headerName: "bad header", headerValue: "1" },
        { headerName: "X-Ok", headerValue: "a\r\nInjected: 1" },
        { headerName: "X-Kept", headerValue: "good" },
      ],
    };
    const state = mapper.toRuleState(model);
    expect(state.rules.map((rule) => rule.headerName)).toEqual(["X-Kept"]);
  });

  it("assigns fresh sequential ids across folders then ungrouped rules", () => {
    const model: RuleStateModel = {
      schemaVersion: 2,
      folders: [{ id: "f", name: "F", rules: [{ headerName: "X-A" }, { headerName: "X-B" }] }],
      rules: [{ headerName: "X-C" }],
    };
    const state = mapper.toRuleState(model);
    expect([...state.folders[0].rules, ...state.rules].map((rule) => rule.id)).toEqual([1, 2, 3]);
  });
});
