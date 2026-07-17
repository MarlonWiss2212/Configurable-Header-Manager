import type { RuleState } from "@/src/domain/entities/rule";
import { findRule, folderOptions } from "@/src/domain/utils/rule-state";
import { DeleteRuleUseCase } from "@/src/domain/usecases/rules/delete-rule";
import { DuplicateRuleUseCase } from "@/src/domain/usecases/rules/duplicate-rule";
import { MoveRuleUseCase } from "@/src/domain/usecases/rules/move-rule";
import { SaveRuleUseCase } from "@/src/domain/usecases/rules/save-rule";
import { ToggleRuleUseCase } from "@/src/domain/usecases/rules/toggle-rule";
import { MoveFolderUseCase } from "@/src/domain/usecases/folders/move-folder";
import { SetFolderColorUseCase } from "@/src/domain/usecases/folders/set-folder-color";
import { ToggleFolderUseCase } from "@/src/domain/usecases/folders/toggle-folder";
import { ToggleFolderCollapseUseCase } from "@/src/domain/usecases/folders/toggle-folder-collapse";
import { ApplyActiveRulesUseCase } from "@/src/domain/usecases/state/apply-active-rules";
import { LoadGlobalEnabledUseCase } from "@/src/domain/usecases/state/load-global-enabled";
import { LoadRuleStateUseCase } from "@/src/domain/usecases/state/load-rule-state";
import { SaveRuleStateUseCase } from "@/src/domain/usecases/state/save-rule-state";
import { SetGlobalEnabledUseCase } from "@/src/domain/usecases/state/set-global-enabled";
import { ExportRulesUseCase } from "@/src/domain/usecases/transfer/export-rules";
import { ImportRulesUseCase } from "@/src/domain/usecases/transfer/import-rules";
import { MergeRuleStatesUseCase } from "@/src/domain/usecases/transfer/merge-rule-states";
import { BrowserStateRepository } from "@/src/data/repositories/browser-state-repository";
import { RuleMigrationRepository } from "@/src/data/repositories/rule-migration-repository";
import type { ImportMode, RuleFormValues } from "@/src/presentation/types/view-contracts";
import { byId, showView } from "@/src/presentation/dom";
import { filterRuleState, renderList } from "@/src/presentation/views/list";
import { initFormView, openForm } from "@/src/presentation/views/form";
import {
  initFolderColorDialog,
  openFolderColorDialog,
} from "@/src/presentation/views/folder-color-dialog";
import { initImportExportView, openImportExport } from "@/src/presentation/views/import-export";

const DOCS_URL =
  "https://github.com/MarlonWiss2212/Configurable-Header-Manager/blob/main/docs/rule-format.md";

// ── Composition root — the only place that knows the data-layer classes ──
const repository = new BrowserStateRepository(new RuleMigrationRepository());
const loadRuleState = new LoadRuleStateUseCase(repository);
const saveRuleState = new SaveRuleStateUseCase(repository);
const applyActiveRules = new ApplyActiveRulesUseCase(repository);
const loadGlobalEnabled = new LoadGlobalEnabledUseCase(repository);
const setGlobalEnabled = new SetGlobalEnabledUseCase(repository);
const importRules = new ImportRulesUseCase(repository);
const exportRules = new ExportRulesUseCase(repository);
const mergeRuleStates = new MergeRuleStatesUseCase();
const deleteRule = new DeleteRuleUseCase();
const duplicateRule = new DuplicateRuleUseCase();
const moveFolder = new MoveFolderUseCase();
const setFolderColor = new SetFolderColorUseCase();
const moveRule = new MoveRuleUseCase();
const saveRule = new SaveRuleUseCase();
const toggleFolder = new ToggleFolderUseCase();
const toggleFolderCollapse = new ToggleFolderCollapseUseCase();
const toggleRule = new ToggleRuleUseCase();

let state: RuleState;
let searchQuery = "";

/** Persist a rule change and re-apply the DNR rules. */
async function commit(nextState: RuleState): Promise<void> {
  state = nextState;
  await saveRuleState.execute(state);
  await applyActiveRules.execute(state);
  renderRules();
}

/** For display-only changes (collapse, colour) — persists without touching DNR. */
async function commitDisplayOnly(nextState: RuleState): Promise<void> {
  state = nextState;
  await saveRuleState.execute(state);
  renderRules();
}

function renderRules(): void {
  renderList(
    byId<HTMLElement>("rules-list"),
    byId<HTMLElement>("rule-count"),
    filterRuleState(state, searchQuery),
    {
      onToggleRule: (id, enabled) => void commit(toggleRule.execute(state, id, enabled)),
      onToggleFolder: (folderId, enabled) =>
        void commit(toggleFolder.execute(state, folderId, enabled)),
      onToggleCollapse: (folderId) =>
        void commitDisplayOnly(toggleFolderCollapse.execute(state, folderId)),
      onPickFolderColor: (folderId, currentColor) =>
        openFolderColorDialog(
          currentColor,
          (color) => void commitDisplayOnly(setFolderColor.execute(state, folderId, color)),
        ),
      onEdit: (id) => openForm(findRule(state, id), folderOptions(state)),
      onDuplicate: (id) => void commit(duplicateRule.execute(state, id)),
      onDelete: (id) => void commit(deleteRule.execute(state, id)),
      onMoveFolder: (folderId, direction) =>
        void commit(moveFolder.execute(state, folderId, direction)),
      onMoveRule: (folderId, id, direction) =>
        void commit(moveRule.execute(state, folderId, id, direction)),
    },
  );
}

async function saveRuleFromForm(id: number | null, values: RuleFormValues): Promise<void> {
  const { folderName, ...ruleValues } = values;
  await commit(saveRule.execute(state, { id: id ?? undefined, ...ruleValues }, folderName));
  showView("view-list");
}

async function importJson(text: string, mode: ImportMode): Promise<void> {
  const incoming = importRules.execute(text);
  await commit(mode === "merge" ? mergeRuleStates.execute(state, incoming) : incoming);
  showView("view-list");
}

export async function initApp(): Promise<void> {
  state = await loadRuleState.execute();
  renderRules();

  const globalToggle = byId<HTMLInputElement>("global-toggle");
  globalToggle.checked = await loadGlobalEnabled.execute();
  globalToggle.addEventListener("change", () => {
    void (async () => {
      await setGlobalEnabled.execute(globalToggle.checked);
      await applyActiveRules.execute(state);
    })();
  });

  byId<HTMLInputElement>("search-input").addEventListener("input", (event) => {
    searchQuery = (event.target as HTMLInputElement).value;
    renderRules();
  });

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

  initFolderColorDialog();

  initImportExportView({
    onCancel: () => showView("view-list"),
    getJson: () => exportRules.execute(state),
    readJsonFile: async (file) => exportRules.execute(importRules.execute(await file.text())),
    onSave: importJson,
  });

  // Re-apply on open so DNR matches the stored state.
  await applyActiveRules.execute(state);
}
