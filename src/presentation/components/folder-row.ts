import type { RuleFolder } from "@/src/domain/entities/rule";
import { escapeHtml, safeColor } from "@/src/presentation/dom";
import { icon } from "@/src/presentation/icons/icons";
import { moveButton } from "@/src/presentation/components/move-button";
import { toggleHtml } from "@/src/presentation/components/toggle";

export function folderRow(folder: RuleFolder, index: number, count: number): string {
  const id = escapeHtml(folder.id);
  const name = escapeHtml(folder.name);
  const enabledCount = folder.rules.filter((rule) => rule.enabled).length;
  const color = safeColor(folder.color);
  const styleAttr = color ? ` style="--accent: ${color}"` : "";
  const open = !folder.collapsed && folder.rules.length > 0;

  return `
    <li class="folder-row${open ? " folder-open" : ""}${color ? " has-accent" : ""}"
        data-folder-id="${id}"${styleAttr}
        role="button" tabindex="0"
        aria-expanded="${folder.collapsed ? "false" : "true"}" aria-label="Folder ${name}">
      ${folderToggle(id, name, enabledCount, folder.rules.length)}
      ${icon("chevron")}
      ${icon("folder")}
      <span class="folder-name">${name}</span>
      <span class="folder-count">${enabledCount}/${folder.rules.length} active</span>
      <div class="folder-actions">
        <button type="button" class="icon-btn folder-color-btn" data-folder-id="${id}"
            data-color="${color}" title="Folder colour" aria-label="Set colour for folder ${name}">
          <span class="folder-color-dot"${color ? ` style="background: ${color}"` : ""}></span>
        </button>
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
