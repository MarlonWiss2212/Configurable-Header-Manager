import type { RuleFolder } from "@/src/domain/entities/rule";
import { escapeHtml } from "@/src/presentation/dom";
import { icon } from "@/src/presentation/icons/icons";
import { moveButton } from "@/src/presentation/components/move-button";
import { toggleHtml } from "@/src/presentation/components/toggle";

export function folderRow(folder: RuleFolder, index: number, count: number): string {
  const id = escapeHtml(folder.id);
  const name = escapeHtml(folder.name);
  const enabledCount = folder.rules.filter((rule) => rule.enabled).length;

  return `
    <li class="folder-row" data-folder-id="${id}" role="button" tabindex="0"
        aria-expanded="${folder.collapsed ? "false" : "true"}" aria-label="Folder ${name}">
      ${folderToggle(id, name, enabledCount, folder.rules.length)}
      ${icon("chevron")}
      ${icon("folder")}
      <span class="folder-name">${name}</span>
      <span class="folder-count">${enabledCount}/${folder.rules.length} active</span>
      <div class="folder-actions">
        ${moveButton("folder", "up", index === 0, `data-folder-id="${id}"`)}
        ${moveButton("folder", "down", index === count - 1, `data-folder-id="${id}"`)}
      </div>
    </li>`;
}

function folderToggle(id: string, name: string, enabledCount: number, ruleCount: number): string {
  return toggleHtml(
    `<input class="toggle-cb folder-toggle" type="checkbox" data-folder-id="${id}"${
      enabledCount === ruleCount ? " checked" : ""
    } aria-label="Toggle folder ${name}">`,
    "Toggle all rules in this folder",
  );
}
