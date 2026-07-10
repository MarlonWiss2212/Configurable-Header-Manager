import type { Rule } from "../types";
import { $, getRadio, setRadio } from "../utils";

export function populateForm(rule: Rule | null): void {
  $<HTMLInputElement>("f-url").value = rule?.urlPattern ?? "";
  $<HTMLInputElement>("f-name").value = rule?.headerName ?? "";
  $<HTMLInputElement>("f-name").classList.remove("input-error");
  $<HTMLInputElement>("f-value").value = rule?.headerValue ?? "";
  setRadio("rule-type", rule?.type ?? "request");
  setRadio("rule-op", rule?.operation ?? "set");
  updateOpOptions();
  updateValueRow();
}

/** Disable the Append option when type=request (not supported by declarativeNetRequest) */
export function updateOpOptions(): void {
  const isRequest = getRadio("rule-type") === "request";
  const appendInput = $<HTMLInputElement>("o-append");
  const appendLabel = $<HTMLLabelElement>("lbl-append");

  appendInput.disabled = isRequest;
  appendLabel.classList.toggle("seg-disabled", isRequest);

  if (isRequest && getRadio("rule-op") === "append") setRadio("rule-op", "set");
}

/** Hide the value field when operation=remove */
export function updateValueRow(): void {
  $<HTMLElement>("f-value-row").style.display = getRadio("rule-op") === "remove" ? "none" : "";
}

export interface FormValues {
  urlPattern: string;
  type: Rule["type"];
  operation: Rule["operation"];
  headerName: string;
  headerValue: string;
}

/** Read and validate the form. Returns null and focuses the invalid field on failure. */
export function readFormValues(): FormValues | null {
  const nameInput = $<HTMLInputElement>("f-name");
  const headerName = nameInput.value.trim();

  if (!headerName) {
    nameInput.classList.add("input-error");
    nameInput.focus();
    return null;
  }

  const operation = getRadio("rule-op") as Rule["operation"];
  return {
    urlPattern: $<HTMLInputElement>("f-url").value.trim() || "*",
    type: getRadio("rule-type") as Rule["type"],
    operation,
    headerName,
    headerValue: operation === "remove" ? "" : $<HTMLInputElement>("f-value").value.trim(),
  };
}
