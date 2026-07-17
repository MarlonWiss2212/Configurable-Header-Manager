import type { Rule } from "@/src/domain/entities/rule";
import { escapeHtml, safeColor } from "@/src/presentation/dom";
import { icon } from "@/src/presentation/icons/icons";
import { moveButton } from "@/src/presentation/components/move-button";
import { toggleHtml } from "@/src/presentation/components/toggle";

export function ruleRow(
  rule: Rule,
  folderId: string | null,
  index: number,
  count: number,
  inFolder: boolean,
  folderColor?: string,
): string {
  const title = rule.name ? escapeHtml(rule.name) : escapeHtml(rule.headerName);
  const folderAttr = folderId === null ? "" : ` data-folder-id="${escapeHtml(folderId)}"`;
  const moveAttrs = `data-id="${rule.id}"${folderAttr}`;
  // A rule with no colour of its own inherits its folder's colour.
  const color = safeColor(rule.color) || safeColor(folderColor);
  const lastInFolder = inFolder && index === count - 1;
  const classes = `rule-row${rule.enabled ? "" : " rule-disabled"}${inFolder ? " in-folder" : ""}${
    lastInFolder ? " in-folder-last" : ""
  }${color ? " has-accent" : ""}`;
  const styleAttr = color ? ` style="--accent: ${color}"` : "";

  return `
    <li class="${classes}"${styleAttr} data-id="${rule.id}">
      ${ruleToggle(rule, title)}
      <div class="rule-info">${ruleInfo(rule, title)}</div>
      <div class="rule-actions">
        ${moveButton("rule", "up", index === 0, moveAttrs)}
        ${moveButton("rule", "down", index === count - 1, moveAttrs)}
        <button class="icon-btn dup-btn" data-id="${rule.id}" title="Duplicate" aria-label="Duplicate ${title}">
          ${icon("duplicate")}
        </button>
        <button class="icon-btn edit-btn" data-id="${rule.id}" title="Edit" aria-label="Edit ${title}">
          ${icon("edit")}
        </button>
        <button class="icon-btn del-btn" data-id="${rule.id}" title="Delete" aria-label="Delete ${title}">
          ${icon("delete")}
        </button>
      </div>
    </li>`;
}

function ruleToggle(rule: Rule, title: string): string {
  return toggleHtml(
    `<input class="toggle-cb rule-toggle" type="checkbox" data-id="${rule.id}"${rule.enabled ? " checked" : ""}
        aria-label="Toggle ${title}">`,
    `${rule.enabled ? "Disable" : "Enable"} rule`,
  );
}

function ruleInfo(rule: Rule, title: string): string {
  const headerName = escapeHtml(rule.headerName);
  const headerValue =
    rule.operation !== "remove" && rule.headerValue ? escapeHtml(rule.headerValue) : "";

  let info = `
    <div class="rule-main">
      <span class="badge">${rule.type === "response" ? "RES" : "REQ"}</span>
      <span class="badge">${rule.operation.toUpperCase()}</span>
      <span class="rule-name">${title}</span>
      ${!rule.name && headerValue ? `<span class="rule-sep">:</span><span class="rule-val">${headerValue}</span>` : ""}
    </div>`;

  if (rule.name)
    info += `<div class="rule-detail">${headerName}${headerValue ? `: ${headerValue}` : ""}</div>`;
  info += `<div class="rule-url">${escapeHtml(rule.urlPattern.trim() || "*")}</div>`;
  if (rule.comment) info += `<div class="rule-comment">${escapeHtml(rule.comment)}</div>`;
  return info;
}
