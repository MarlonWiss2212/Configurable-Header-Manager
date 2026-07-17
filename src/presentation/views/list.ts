import type { Rule, RuleState } from "@/src/domain/entities/rule";
import { enabledRules, flattenRules } from "@/src/domain/utils/rule-state";
import type { ListCallbacks } from "@/src/presentation/types/view-contracts";
import { setHtml } from "@/src/presentation/dom";
import { emptyState } from "@/src/presentation/components/empty-state";
import { folderRow } from "@/src/presentation/components/folder-row";
import { ruleRow } from "@/src/presentation/components/rule-row";

function ruleMatches(rule: Rule, query: string): boolean {
  return [rule.name, rule.headerName, rule.headerValue, rule.urlPattern, rule.comment].some(
    (field) => field?.toLowerCase().includes(query),
  );
}

/** Display-only filter: keeps rules matching the query, and folders whose name matches
 *  (with all their rules) or that contain a matching rule. */
export function filterRuleState(state: RuleState, rawQuery: string): RuleState {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return state;

  return {
    ...state,
    folders: state.folders
      .map((folder) =>
        folder.name.toLowerCase().includes(query)
          ? folder
          : { ...folder, rules: folder.rules.filter((rule) => ruleMatches(rule, query)) },
      )
      .filter((folder) => folder.rules.length > 0 || folder.name.toLowerCase().includes(query)),
    rules: state.rules.filter((rule) => ruleMatches(rule, query)),
  };
}

export function renderList(
  container: HTMLElement,
  countElement: HTMLElement,
  state: RuleState,
  callbacks: ListCallbacks,
): void {
  const allRules = flattenRules(state);
  const activeRules = enabledRules(state);
  countElement.textContent = allRules.length
    ? `${activeRules.length} of ${allRules.length} active`
    : "";

  const folderMarkup = state.folders
    .map((folder, folderIndex) => {
      const members = folder.collapsed
        ? ""
        : folder.rules
            .map((rule, ruleIndex) =>
              ruleRow(rule, folder.id, ruleIndex, folder.rules.length, true, folder.color),
            )
            .join("");
      return folderRow(folder, folderIndex, state.folders.length) + members;
    })
    .join("");
  const ungroupedMarkup = state.rules
    .map((rule, index) => ruleRow(rule, null, index, state.rules.length, false))
    .join("");

  setHtml(container, allRules.length ? folderMarkup + ungroupedMarkup : emptyState());

  container.querySelectorAll<HTMLInputElement>(".rule-toggle").forEach((checkbox) => {
    checkbox.addEventListener("change", () =>
      callbacks.onToggleRule(Number(checkbox.dataset.id), checkbox.checked),
    );
  });

  container.querySelectorAll<HTMLElement>(".folder-row").forEach((row) => {
    const folderId = row.dataset.folderId ?? "";
    const folder = state.folders.find((candidate) => candidate.id === folderId);
    const enabledCount = folder?.rules.filter((rule) => rule.enabled).length ?? 0;

    const folderToggle = row.querySelector<HTMLInputElement>(".folder-toggle");
    if (folderToggle && folder) {
      folderToggle.indeterminate = enabledCount > 0 && enabledCount < folder.rules.length;
      folderToggle.addEventListener("change", () => {
        folderToggle.indeterminate = false;
        callbacks.onToggleFolder(folderId, folderToggle.checked);
      });
    }

    const colorButton = row.querySelector<HTMLButtonElement>(".folder-color-btn");
    colorButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      callbacks.onPickFolderColor(folderId, colorButton.dataset.color ?? "");
    });

    row.addEventListener("click", (event) => {
      if ((event.target as HTMLElement).closest(".toggle, .folder-actions")) return;
      callbacks.onToggleCollapse(folderId);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      callbacks.onToggleCollapse(folderId);
    });
  });

  container.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => callbacks.onEdit(Number(button.dataset.id)));
  });
  container.querySelectorAll<HTMLButtonElement>(".dup-btn").forEach((button) => {
    button.addEventListener("click", () => callbacks.onDuplicate(Number(button.dataset.id)));
  });
  container.querySelectorAll<HTMLButtonElement>(".del-btn").forEach((button) => {
    button.addEventListener("click", () => callbacks.onDelete(Number(button.dataset.id)));
  });
  container.querySelectorAll<HTMLButtonElement>(".move-folder-btn").forEach((button) => {
    button.addEventListener("click", () =>
      callbacks.onMoveFolder(
        button.dataset.folderId ?? "",
        button.dataset.dir === "up" ? "up" : "down",
      ),
    );
  });
  container.querySelectorAll<HTMLButtonElement>(".move-rule-btn").forEach((button) => {
    button.addEventListener("click", () =>
      callbacks.onMoveRule(
        button.dataset.folderId ?? null,
        Number(button.dataset.id),
        button.dataset.dir === "up" ? "up" : "down",
      ),
    );
  });
}
