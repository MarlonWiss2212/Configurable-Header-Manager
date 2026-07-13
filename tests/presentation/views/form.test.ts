import { beforeEach, describe, expect, it } from "vitest";
import type { Rule } from "@/src/domain/entities/rule";
import { populateForm, readFormValues } from "@/src/presentation/views/form";

const FORM_FIXTURE = `
  <input id="f-url" type="text">
  <input type="radio" name="rule-type" value="request" checked>
  <input type="radio" name="rule-type" value="response">
  <input type="radio" name="rule-op" value="set" checked>
  <input type="radio" name="rule-op" value="remove">
  <input type="radio" name="rule-op" value="append" id="o-append">
  <label id="lbl-append"></label>
  <input id="f-name" type="text">
  <div id="f-value-row"><input id="f-value" type="text"></div>
  <input id="f-rule-name" type="text">
  <input id="f-folder" type="text">
  <datalist id="folder-options"></datalist>
  <input id="f-comment" type="text">
`;

const rule: Rule = {
  id: 3,
  enabled: true,
  urlPattern: "example.com",
  type: "response",
  operation: "append",
  headerName: "X-Extra",
  headerValue: "on",
  name: "Extra marker",
  comment: "adds marker",
};

beforeEach(() => {
  document.body.innerHTML = FORM_FIXTURE;
});

describe("form view", () => {
  it("round-trips a rule and folder location", () => {
    populateForm({ rule, folderId: "markers" }, [{ id: "markers", name: "Markers" }]);
    expect(readFormValues()).toEqual({
      urlPattern: "example.com",
      type: "response",
      operation: "append",
      headerName: "X-Extra",
      headerValue: "on",
      name: "Extra marker",
      folderName: "Markers",
      comment: "adds marker",
    });
  });

  it("does not put folder on the rule entity", () => {
    populateForm(null, [{ id: "staging", name: "Staging" }]);
    (document.getElementById("f-name") as HTMLInputElement).value = "X-A";
    (document.getElementById("f-folder") as HTMLInputElement).value = "Staging";
    expect(readFormValues()).toMatchObject({ folderName: "Staging" });
    expect(readFormValues()).not.toHaveProperty("folder");
  });

  it("validates required header name and defaults empty URL", () => {
    populateForm(null);
    expect(readFormValues()).toBeNull();
    (document.getElementById("f-name") as HTMLInputElement).value = "X-A";
    expect(readFormValues()?.urlPattern).toBe("*");
  });
});
