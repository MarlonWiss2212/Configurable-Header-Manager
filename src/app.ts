import type { Rule } from './types';
import { loadRules, persistRules } from './storage';
import { applyRulesToDNR } from './dnr';
import { $, nextId } from './utils';
import { DOCS_URL } from './config';
import { renderList } from './views/list';
import { populateForm, updateOpOptions, updateValueRow, readFormValues } from './views/form';
import { setTextareaContent, parseTextarea, fetchFromUrl, downloadJson } from './views/import-export';

let rules: Rule[] = [];
let editingId: number | null = null;

function showView(id: string): void {
  document.querySelectorAll<HTMLElement>('.view').forEach((v) => v.classList.remove('active'));
  $<HTMLElement>(id).classList.add('active');
}

async function saveAndSync(): Promise<void> {
  await persistRules(rules);
  await applyRulesToDNR(rules);
}

function refreshList(): void {
  renderList($<HTMLElement>('rules-list'), $<HTMLElement>('rule-count'), rules, {
    onToggle: async (id, enabled) => {
      rules = rules.map((r) => (r.id === id ? { ...r, enabled } : r));
      await saveAndSync();
      refreshList();
    },
    onEdit: (id) => openForm(id),
    onDelete: async (id) => {
      rules = rules.filter((r) => r.id !== id);
      await saveAndSync();
      refreshList();
    },
  });
}

function openForm(id: number | null = null): void {
  editingId = id;
  const rule = id !== null ? (rules.find((r) => r.id === id) ?? null) : null;
  $<HTMLElement>('form-title').textContent = id !== null ? 'Edit Rule' : 'Add Rule';
  populateForm(rule);
  showView('view-form');
  $<HTMLInputElement>('f-name').focus();
}

async function submitForm(): Promise<void> {
  const values = readFormValues();
  if (!values) return;

  const rule: Rule = {
    id: editingId ?? nextId(rules),
    enabled: editingId !== null ? (rules.find((r) => r.id === editingId)?.enabled ?? true) : true,
    ...values,
  };

  rules = editingId !== null
    ? rules.map((r) => (r.id === editingId ? rule : r))
    : [...rules, rule];

  await saveAndSync();
  showView('view-list');
  refreshList();
}

function openIE(): void {
  setTextareaContent($<HTMLTextAreaElement>('json-area'), rules);
  hideUrlError();
  showView('view-ie');
}

function hideUrlError(): void {
  const el = $<HTMLElement>('url-error');
  el.textContent = '';
  el.hidden = true;
}

function showUrlError(msg: string): void {
  const el = $<HTMLElement>('url-error');
  el.textContent = msg;
  el.hidden = false;
}

async function handleFetchUrl(): Promise<void> {
  const url = $<HTMLInputElement>('url-input').value.trim();
  const btn = $<HTMLButtonElement>('btn-fetch-url');
  hideUrlError();

  try {
    btn.disabled = true;
    btn.textContent = 'Fetching…';
    const fetched = await fetchFromUrl(url);
    setTextareaContent($<HTMLTextAreaElement>('json-area'), fetched);
    $<HTMLInputElement>('url-input').value = '';
  } catch (err) {
    showUrlError(err instanceof Error ? err.message : 'Fetch failed — check the URL and CORS.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Fetch';
  }
}

async function handleImport(): Promise<void> {
  try {
    rules = parseTextarea($<HTMLTextAreaElement>('json-area'));
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Invalid JSON');
    return;
  }
  await saveAndSync();
  showView('view-list');
  refreshList();
}

export async function initApp(): Promise<void> {
  rules = await loadRules();
  refreshList();

  // List view
  $<HTMLButtonElement>('btn-add').addEventListener('click', () => openForm());
  $<HTMLButtonElement>('btn-ie').addEventListener('click', openIE);
  $<HTMLAnchorElement>('link-docs').addEventListener('click', (e) => {
    e.preventDefault();
    void browser.tabs.create({ url: DOCS_URL });
  });

  // Form view
  $<HTMLButtonElement>('btn-back-form').addEventListener('click', () => {
    showView('view-list');
  });
  $<HTMLButtonElement>('btn-save').addEventListener('click', () => void submitForm());
  document.querySelectorAll<HTMLInputElement>('input[name="rule-type"]').forEach((i) =>
    i.addEventListener('change', () => {
      updateOpOptions();
      updateValueRow();
    }),
  );
  document.querySelectorAll<HTMLInputElement>('input[name="rule-op"]').forEach((i) =>
    i.addEventListener('change', updateValueRow),
  );
  $<HTMLInputElement>('f-name').addEventListener('input', () =>
    $<HTMLInputElement>('f-name').classList.remove('input-error'),
  );
  $<HTMLFormElement>('rule-form').addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      void submitForm();
    }
  });

  // IE view
  $<HTMLButtonElement>('btn-back-ie').addEventListener('click', () => showView('view-list'));
  $<HTMLButtonElement>('btn-fetch-url').addEventListener('click', () => void handleFetchUrl());
  $<HTMLInputElement>('url-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void handleFetchUrl();
  });
  $<HTMLButtonElement>('btn-download').addEventListener('click', () => downloadJson(rules));
  $<HTMLButtonElement>('btn-import').addEventListener('click', () => void handleImport());
}
