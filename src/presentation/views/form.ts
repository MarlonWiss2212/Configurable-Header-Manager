import type { Rule } from "@/src/domain/entities/rule";
import { optionalText } from "@/src/domain/utils/rule-validation";
import type {
  EditableRule,
  FolderOption,
  FormHandlers,
  RuleFormValues,
} from "@/src/presentation/types/view-contracts";
import {
  byId,
  checkRadio,
  escapeHtml,
  getRadioValue,
  setHtml,
  showView,
} from "@/src/presentation/dom";

let editingId: number | null = null;

export function initFormView(handlers: FormHandlers): void {
  const submit = (): void => {
    const values = readFormValues();
    if (values) handlers.onSave(editingId, values);
  };

  byId<HTMLButtonElement>("btn-back-form").addEventListener("click", handlers.onCancel);
  byId<HTMLButtonElement>("btn-cancel-form").addEventListener("click", handlers.onCancel);
  byId<HTMLButtonElement>("btn-save").addEventListener("click", submit);
  byId<HTMLButtonElement>("btn-save-header").addEventListener("click", submit);

  document.querySelectorAll<HTMLInputElement>('input[name="rule-type"]').forEach((radio) =>
    radio.addEventListener("change", () => {
      updateOperationOptions();
      updateValueRow();
    }),
  );
  document
    .querySelectorAll<HTMLInputElement>('input[name="rule-op"]')
    .forEach((radio) => radio.addEventListener("change", updateValueRow));

  const headerNameInput = byId<HTMLInputElement>("f-name");
  headerNameInput.addEventListener("input", () => {
    headerNameInput.classList.remove("input-error");
    headerNameInput.removeAttribute("aria-invalid");
  });

  byId<HTMLFormElement>("rule-form").addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter" && (event.target as HTMLElement).tagName !== "TEXTAREA") {
      event.preventDefault();
      submit();
    }
  });
}

export function openForm(editable: EditableRule, folders: FolderOption[]): void {
  editingId = editable?.rule.id ?? null;
  byId<HTMLElement>("form-title").textContent = editable ? "Edit Rule" : "Add Rule";
  populateForm(editable, folders);
  showView("view-form");
  byId<HTMLInputElement>("f-name").focus();
}

export function populateForm(editable: EditableRule, folders: FolderOption[] = []): void {
  const rule = editable?.rule ?? null;
  const currentFolder = folders.find((folder) => folder.id === editable?.folderId)?.name ?? "";
  const headerNameInput = byId<HTMLInputElement>("f-name");
  headerNameInput.value = rule?.headerName ?? "";
  headerNameInput.classList.remove("input-error");
  headerNameInput.removeAttribute("aria-invalid");

  byId<HTMLInputElement>("f-url").value = rule?.urlPattern ?? "";
  byId<HTMLInputElement>("f-value").value = rule?.headerValue ?? "";
  byId<HTMLInputElement>("f-rule-name").value = rule?.name ?? "";
  byId<HTMLInputElement>("f-folder").value = currentFolder;
  byId<HTMLInputElement>("f-comment").value = rule?.comment ?? "";
  setHtml(
    byId<HTMLDataListElement>("folder-options"),
    folders.map((folder) => `<option value="${escapeHtml(folder.name)}"></option>`).join(""),
  );

  checkRadio("rule-type", rule?.type ?? "request");
  checkRadio("rule-op", rule?.operation ?? "set");
  checkRadio("rule-color", rule?.color ?? "");
  updateOperationOptions();
  updateValueRow();
}

export function readFormValues(): RuleFormValues | null {
  const headerNameInput = byId<HTMLInputElement>("f-name");
  const headerName = headerNameInput.value.trim();

  if (!headerName) {
    headerNameInput.classList.add("input-error");
    headerNameInput.setAttribute("aria-invalid", "true");
    headerNameInput.focus();
    return null;
  }

  const operation = getRadioValue("rule-op") as Rule["operation"];
  return {
    urlPattern: byId<HTMLInputElement>("f-url").value.trim() || "*",
    type: getRadioValue("rule-type") as Rule["type"],
    operation,
    headerName,
    headerValue: operation === "remove" ? "" : byId<HTMLInputElement>("f-value").value.trim(),
    name: optionalText(byId<HTMLInputElement>("f-rule-name").value),
    folderName: optionalText(byId<HTMLInputElement>("f-folder").value),
    comment: optionalText(byId<HTMLInputElement>("f-comment").value),
    color: optionalText(getRadioValue("rule-color")),
  };
}

function updateOperationOptions(): void {
  const isRequest = getRadioValue("rule-type") === "request";
  byId<HTMLInputElement>("o-append").disabled = isRequest;
  byId<HTMLLabelElement>("lbl-append").classList.toggle("seg-disabled", isRequest);

  if (isRequest && getRadioValue("rule-op") === "append") checkRadio("rule-op", "set");
}

function updateValueRow(): void {
  byId<HTMLElement>("f-value-row").style.display =
    getRadioValue("rule-op") === "remove" ? "none" : "";
}
