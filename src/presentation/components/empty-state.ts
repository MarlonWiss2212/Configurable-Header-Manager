import { icon } from "@/src/presentation/icons/icons";

export function emptyState(): string {
  return `
    <div class="empty-state">
      ${icon("pulse")}
      <p>No rules yet</p>
      <span>Click <strong>+ Add Rule</strong> to get started.</span>
    </div>`;
}
