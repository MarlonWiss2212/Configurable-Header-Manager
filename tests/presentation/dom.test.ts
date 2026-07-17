import { describe, expect, it } from "vitest";
import {
  byId,
  checkRadio,
  escapeHtml,
  getRadioValue,
  safeColor,
  showView,
} from "@/src/presentation/dom";

describe("DOM helpers", () => {
  it("escapes HTML", () => {
    expect(escapeHtml(`<b>"x"</b>`)).toBe("&lt;b&gt;&quot;x&quot;&lt;/b&gt;");
    expect(escapeHtml(`it's a 'test'`)).toBe("it&#39;s a &#39;test&#39;");
  });

  it("finds elements and toggles views/radios", () => {
    document.body.innerHTML = `
      <div id="a" class="view active"></div>
      <div id="b" class="view"></div>
      <input type="radio" name="mode" value="one">
      <input type="radio" name="mode" value="two">
    `;

    expect(byId("a").id).toBe("a");
    showView("b");
    expect(document.getElementById("b")?.classList.contains("active")).toBe(true);
    checkRadio("mode", "two");
    expect(getRadioValue("mode")).toBe("two");
  });

  it("accepts valid hex colours and rejects anything else", () => {
    expect(safeColor("#fff")).toBe("#fff");
    expect(safeColor("#ff3b30")).toBe("#ff3b30");
    expect(safeColor("red")).toBe("");
    expect(safeColor('#fff"><script>')).toBe("");
    expect(safeColor(undefined)).toBe("");
  });
});
