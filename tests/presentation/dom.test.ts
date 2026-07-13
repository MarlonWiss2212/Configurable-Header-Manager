import { describe, expect, it } from "vitest";
import { byId, checkRadio, escapeHtml, getRadioValue, showView } from "@/src/presentation/dom";

describe("DOM helpers", () => {
  it("escapes HTML", () => {
    expect(escapeHtml(`<b>"x"</b>`)).toBe("&lt;b&gt;&quot;x&quot;&lt;/b&gt;");
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
});
