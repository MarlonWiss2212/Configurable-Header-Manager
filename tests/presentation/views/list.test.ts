import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Rule, RuleState } from "@/src/domain/entities/rule";
import type { ListCallbacks } from "@/src/presentation/types/view-contracts";
import { filterRuleState, renderList } from "@/src/presentation/views/list";

function rule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: 1,
    enabled: true,
    urlPattern: "*",
    type: "request",
    operation: "set",
    headerName: "X-Test",
    headerValue: "abc",
    ...overrides,
  };
}

function state(collapsed = false): RuleState {
  return {
    schemaVersion: 2,
    folders: [
      {
        id: "staging",
        name: "Staging",
        rules: [rule({ id: 1 }), rule({ id: 2, enabled: false })],
        collapsed: collapsed || undefined,
      },
    ],
    rules: [rule({ id: 3 })],
  };
}

function callbacks(): ListCallbacks {
  return {
    onToggleRule: vi.fn(),
    onToggleFolder: vi.fn(),
    onToggleCollapse: vi.fn(),
    onPickFolderColor: vi.fn(),
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onMoveFolder: vi.fn(),
    onMoveRule: vi.fn(),
  };
}

let container: HTMLElement;
let count: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = `<ul id="list"></ul><span id="count"></span>`;
  container = document.getElementById("list") as HTMLElement;
  count = document.getElementById("count") as HTMLElement;
});

describe("renderList", () => {
  it("renders nested folders, ungrouped rules, and counts", () => {
    renderList(container, count, state(), callbacks());
    expect(container.querySelector(".folder-name")?.textContent).toBe("Staging");
    expect(container.querySelectorAll(".rule-row.in-folder")).toHaveLength(2);
    expect(container.querySelectorAll(".rule-row")).toHaveLength(3);
    expect(count.textContent).toBe("2 of 3 active");
  });

  it("hides folder members when the folder is collapsed", () => {
    renderList(container, count, state(true), callbacks());
    expect(container.querySelectorAll(".rule-row.in-folder")).toHaveLength(0);
    expect(container.querySelector(".folder-row")?.getAttribute("aria-expanded")).toBe("false");
    // Ungrouped rules stay visible
    expect(container.querySelectorAll(".rule-row")).toHaveLength(1);
  });

  it("marks an expanded folder as expanded", () => {
    renderList(container, count, state(), callbacks());
    expect(container.querySelector(".folder-row")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("forms a folder card: open header + last member rounded, collapsed header plain", () => {
    renderList(container, count, state(), callbacks());
    expect(container.querySelector(".folder-row")?.classList.contains("folder-open")).toBe(true);
    const members = container.querySelectorAll(".rule-row.in-folder");
    expect(members[members.length - 1].classList.contains("in-folder-last")).toBe(true);

    renderList(container, count, state(true), callbacks());
    expect(container.querySelector(".folder-row")?.classList.contains("folder-open")).toBe(false);
  });

  it("escapes user-controlled text", () => {
    renderList(
      container,
      count,
      {
        schemaVersion: 2,
        folders: [{ id: "x", name: `<img src=x>`, rules: [rule({ headerName: `<b>X</b>` })] }],
        rules: [],
      },
      callbacks(),
    );
    expect(container.querySelector("img:not(.icon)")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
  });

  it("fires toggle, edit, delete, and move callbacks", () => {
    const cb = callbacks();
    renderList(container, count, state(), cb);

    const ruleToggle = container.querySelector<HTMLInputElement>(".rule-toggle");
    ruleToggle?.dispatchEvent(new Event("change"));
    expect(cb.onToggleRule).toHaveBeenCalledWith(1, true);

    container.querySelector<HTMLButtonElement>(".edit-btn")?.click();
    expect(cb.onEdit).toHaveBeenCalledWith(1);

    container.querySelector<HTMLButtonElement>(".dup-btn")?.click();
    expect(cb.onDuplicate).toHaveBeenCalledWith(1);

    container.querySelector<HTMLButtonElement>(".del-btn")?.click();
    expect(cb.onDelete).toHaveBeenCalledWith(1);

    container.querySelector<HTMLButtonElement>('.move-rule-btn[data-dir="down"]')?.click();
    expect(cb.onMoveRule).toHaveBeenCalledWith("staging", 1, "down");
  });

  it("marks the folder toggle indeterminate when only some rules are enabled", () => {
    renderList(container, count, state(), callbacks());
    const folderToggle = container.querySelector<HTMLInputElement>(".folder-toggle");
    expect(folderToggle?.indeterminate).toBe(true);
    expect(folderToggle?.checked).toBe(false);
  });

  it("collapses on folder-row click but not on clicks inside the actions or toggle", () => {
    const cb = callbacks();
    renderList(container, count, state(), cb);
    const row = container.querySelector<HTMLElement>(".folder-row");
    if (!row) throw new Error("folder row not rendered");

    row.querySelector<HTMLElement>(".folder-actions button")?.click();
    row.querySelector<HTMLInputElement>(".folder-toggle")?.click();
    expect(cb.onToggleCollapse).not.toHaveBeenCalled();

    row.click();
    expect(cb.onToggleCollapse).toHaveBeenCalledWith("staging");
  });

  it("disables boundary move buttons", () => {
    renderList(container, count, state(), callbacks());
    expect(
      container.querySelector<HTMLButtonElement>('.move-folder-btn[data-dir="up"]')?.disabled,
    ).toBe(true);
    expect(
      container.querySelector<HTMLButtonElement>('.move-rule-btn[data-id="1"][data-dir="up"]')
        ?.disabled,
    ).toBe(true);
  });
});

describe("colour accents", () => {
  function colored(): RuleState {
    return {
      schemaVersion: 2,
      folders: [{ id: "staging", name: "Staging", color: "#ff3b30", rules: [rule({ id: 1 })] }],
      rules: [rule({ id: 2, color: "#007aff" })],
    };
  }

  it("marks coloured rows with an accent and the colour custom property", () => {
    renderList(container, count, colored(), callbacks());
    const folder = container.querySelector<HTMLElement>(".folder-row.has-accent");
    const ungrouped = container.querySelector<HTMLElement>(".rule-row:not(.in-folder).has-accent");
    expect(folder?.style.getPropertyValue("--accent")).toBe("#ff3b30");
    expect(ungrouped?.style.getPropertyValue("--accent")).toBe("#007aff");
  });

  it("opens the folder colour picker with the folder's current colour", () => {
    const cb = callbacks();
    renderList(container, count, colored(), cb);
    container.querySelector<HTMLButtonElement>(".folder-color-btn")?.click();
    expect(cb.onPickFolderColor).toHaveBeenCalledWith("staging", "#ff3b30");
  });

  it("a rule without its own colour inherits the folder's colour", () => {
    const state: RuleState = {
      schemaVersion: 2,
      folders: [{ id: "f", name: "F", color: "#34c759", rules: [rule({ id: 1 })] }],
      rules: [],
    };
    renderList(container, count, state, callbacks());
    const member = container.querySelector<HTMLElement>(".rule-row.in-folder");
    expect(member?.classList.contains("has-accent")).toBe(true);
    expect(member?.style.getPropertyValue("--accent")).toBe("#34c759");
  });
});

describe("filterRuleState", () => {
  function searchState(): RuleState {
    return {
      schemaVersion: 2,
      folders: [
        {
          id: "auth",
          name: "Auth headers",
          rules: [
            rule({ id: 1, headerName: "Authorization", headerValue: "Bearer x" }),
            rule({ id: 2, headerName: "X-Api-Key", headerValue: "secret" }),
          ],
        },
      ],
      rules: [rule({ id: 3, name: "CORS", urlPattern: "*://api.example.com/*" })],
    };
  }

  it("returns the state unchanged for a blank query", () => {
    expect(filterRuleState(searchState(), "   ")).toStrictEqual(searchState());
  });

  it("keeps only rules matching header name/value/url/name", () => {
    const result = filterRuleState(searchState(), "authorization");
    expect(result.folders[0].rules.map((r) => r.id)).toEqual([1]);
    expect(result.rules).toEqual([]);

    const byUrl = filterRuleState(searchState(), "api.example.com");
    expect(byUrl.rules.map((r) => r.id)).toEqual([3]);
  });

  it("keeps every rule when the folder name matches", () => {
    const result = filterRuleState(searchState(), "auth headers");
    expect(result.folders[0].rules.map((r) => r.id)).toEqual([1, 2]);
  });

  it("drops folders with no matching rules and a non-matching name", () => {
    const result = filterRuleState(searchState(), "cors");
    expect(result.folders).toEqual([]);
    expect(result.rules.map((r) => r.id)).toEqual([3]);
  });
});
