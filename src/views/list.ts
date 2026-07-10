import type { Rule } from '../types';
import { esc } from '../utils';

export interface ListCallbacks {
  onToggle: (id: number, enabled: boolean) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function opBadgeClass(op: Rule['operation']): string {
  if (op === 'remove') return 'badge-remove';
  if (op === 'append') return 'badge-append';
  return 'badge-set';
}

function ruleRow(r: Rule): string {
  const url = r.urlPattern?.trim() || '*';
  const safeId = Number(r.id);
  return `
    <li class="rule-row${r.enabled ? '' : ' rule-disabled'}" data-id="${safeId}">
      <label class="toggle" title="${r.enabled ? 'Disable' : 'Enable'} rule">
        <input class="toggle-cb" type="checkbox" data-id="${safeId}"${r.enabled ? ' checked' : ''}
          aria-label="Toggle ${esc(r.headerName)}">
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
      </label>

      <div class="rule-info">
        <div class="rule-main">
          <span class="badge ${r.type === 'response' ? 'badge-res' : 'badge-req'}">
            ${r.type === 'response' ? 'RES' : 'REQ'}
          </span>
          <span class="badge ${opBadgeClass(r.operation)}">${r.operation.toUpperCase()}</span>
          <span class="rule-name">${esc(r.headerName)}</span>
          ${r.operation !== 'remove' && r.headerValue
            ? `<span class="rule-sep">:</span><span class="rule-val">${esc(r.headerValue)}</span>`
            : ''}
        </div>
        <div class="rule-url">${esc(url)}</div>
      </div>

      <div class="rule-actions">
        <button class="icon-btn edit-btn" data-id="${safeId}" title="Edit"
          aria-label="Edit ${esc(r.headerName)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="icon-btn del-btn" data-id="${safeId}" title="Delete"
          aria-label="Delete ${esc(r.headerName)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>
    </li>`;
}

function emptyState(): string {
  return `
    <div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
      <p>No rules yet</p>
      <span>Click <strong>+ Add Rule</strong> to get started.</span>
    </div>`;
}

export function renderList(
  container: HTMLElement,
  countEl: HTMLElement,
  rules: Rule[],
  callbacks: ListCallbacks,
): void {
  const activeCount = rules.filter((r) => r.enabled).length;
  countEl.textContent = rules.length ? `${activeCount} of ${rules.length} active` : '';

  container.innerHTML = rules.length ? rules.map(ruleRow).join('') : emptyState();

  container.querySelectorAll<HTMLInputElement>('.toggle-cb').forEach((cb) => {
    cb.addEventListener('change', () =>
      callbacks.onToggle(Number(cb.dataset.id), cb.checked),
    );
  });
  container.querySelectorAll<HTMLButtonElement>('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => callbacks.onEdit(Number(btn.dataset.id)));
  });
  container.querySelectorAll<HTMLButtonElement>('.del-btn').forEach((btn) => {
    btn.addEventListener('click', () => callbacks.onDelete(Number(btn.dataset.id)));
  });
}
