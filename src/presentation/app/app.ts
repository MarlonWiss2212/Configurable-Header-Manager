import type { RuleState } from "@/src/domain/entities/rule";
import { findRule, folderOptions } from "@/src/domain/utils/rule-state";
import { DeleteRuleUseCase } from "@/src/domain/usecases/rules/delete-rule";
import { MoveRuleUseCase } from "@/src/domain/usecases/rules/move-rule";
import { SaveRuleUseCase } from "@/src/domain/usecases/rules/save-rule";
import { ToggleRuleUseCase } from "@/src/domain/usecases/rules/toggle-rule";
import { MoveFolderUseCase } from "@/src/domain/usecases/folders/move-folder";
import { ToggleFolderUseCase } from "@/src/domain/usecases/folders/toggle-folder";
import { ToggleFolderCollapseUseCase } from "@/src/domain/usecases/folders/toggle-folder-collapse";
import { ApplyActiveRulesUseCase } from "@/src/domain/usecases/state/apply-active-rules";
import { CommitRuleStateUseCase } from "@/src/domain/usecases/state/commit-rule-state";
import { LoadRuleStateUseCase } from "@/src/domain/usecases/state/load-rule-state";
import { SaveRuleStateUseCase } from "@/src/domain/usecases/state/save-rule-state";
import { ExportRulesUseCase } from "@/src/domain/usecases/transfer/export-rules";
import { FetchRemoteRulesUseCase } from "@/src/domain/usecases/transfer/fetch-remote-rules";
import { ImportRulesUseCase } from "@/src/domain/usecases/transfer/import-rules";
import { BrowserStateRepository } from "@/src/data/repositories/browser-state-repository";
import { RuleMigrationRepository } from "@/src/data/repositories/rule-migration-repository";
import type { RuleFormValues } from "@/src/presentation/types/view-contracts";
import { byId, showView } from "@/src/presentation/dom";
import { renderList } from "@/src/presentation/views/list";
import { initFormView, openForm } from "@/src/presentation/views/form";
import { initImportExportView, openImportExport } from "@/src/presentation/views/import-export";

const DOCS_URL =
  "https://github.com/MarlonWiss2212/Configurable-Header-Manager/blob/main/docs/rule-format.md";

// ── Composition root — the only place that knows the data-layer classes ──
const repository = new BrowserStateRepository(new RuleMigrationRepository());
const applyActiveRules = new ApplyActiveRulesUseCase(repository);
const commitRuleState = new CommitRuleStateUseCase(repository, applyActiveRules);
const loadRuleState = new LoadRuleStateUseCase(repository);
const saveRuleState = new SaveRuleStateUseCase(repository);
const importRules = new ImportRulesUseCase(repository);
const exportRules = new ExportRulesUseCase(repository);
const fetchRemoteRules = new FetchRemoteRulesUseCase(repository);
const deleteRule = new DeleteRuleUseCase();
const moveFolder = new MoveFolderUseCase();
const moveRule = new MoveRuleUseCase();
const saveRule = new SaveRuleUseCase();
const toggleFolder = new ToggleFolderUseCase();
const toggleFolderCollapse = new ToggleFolderCollapseUseCase();
const toggleRule = new ToggleRuleUseCase();

let state: RuleState;

async function commit(nextState: RuleState): Promise<void> {
  state = nextState;
  await commitRuleState.execute(state);
  renderRules();
}

/** For display-only changes — persists without re-applying the DNR rules */
async function commitDisplayOnly(nextState: RuleState): Promise<void> {
  state = nextState;
  await saveRuleState.execute(state);
  renderRules();
}

function renderRules(): void {
  renderList(byId<HTMLElement>("rules-list"), byId<HTMLElement>("rule-count"), state, {
    onToggleRule: (id, enabled) => void commit(toggleRule.execute(state, id, enabled)),
    onToggleFolder: (folderId, enabled) =>
      void commit(toggleFolder.execute(state, folderId, enabled)),
    onToggleCollapse: (folderId) =>
      void commitDisplayOnly(toggleFolderCollapse.execute(state, folderId)),
    onEdit: (id) => openForm(findRule(state, id), folderOptions(state)),
    onDelete: (id) => void commit(deleteRule.execute(state, id)),
    onMoveFolder: (folderId, direction) =>
      void commit(moveFolder.execute(state, folderId, direction)),
    onMoveRule: (folderId, id, direction) =>
      void commit(moveRule.execute(state, folderId, id, direction)),
  });
}

async function saveRuleFromForm(id: number | null, values: RuleFormValues): Promise<void> {
  const { folderName, ...ruleValues } = values;
  await commit(saveRule.execute(state, { id: id ?? undefined, ...ruleValues }, folderName));
  showView("view-list");
}

async function importJson(text: string): Promise<void> {
  await commit(importRules.execute(text));
  showView("view-list");
}

export async function initApp(): Promise<void> {
  state = await loadRuleState.execute();
  renderRules();

  byId<HTMLButtonElement>("btn-add").addEventListener("click", () =>
    openForm(null, folderOptions(state)),
  );
  byId<HTMLButtonElement>("btn-ie").addEventListener("click", () =>
    openImportExport(exportRules.execute(state)),
  );
  byId<HTMLAnchorElement>("link-docs").addEventListener("click", (event) => {
    event.preventDefault();
    void browser.tabs.create({ url: DOCS_URL });
  });

  initFormView({
    onCancel: () => showView("view-list"),
    onSave: (id, values) => void saveRuleFromForm(id, values),
  });

  initImportExportView({
    onCancel: () => showView("view-list"),
    getJson: () => exportRules.execute(state),
    fetchJsonFromUrl: async (url) => exportRules.execute(await fetchRemoteRules.execute(url)),
    readJsonFile: async (file) => exportRules.execute(importRules.execute(await file.text())),
    onSave: importJson,
  });
}
