import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Configurable Header Manager",
    // version + description are inherited from package.json (single source of truth)
    permissions: ["storage", "declarativeNetRequest"],
    host_permissions: ["<all_urls>"],
    browser_specific_settings: {
      gecko: {
        id: "header-manager@local",
        strict_min_version: "128.0",
        data_collection_permissions: {
          required: ["none"],
          optional: [],
        },
      },
    },
  },
});
