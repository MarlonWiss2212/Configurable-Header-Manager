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
        // data_collection_permissions requires Firefox 140 (desktop) / 142 (Android)
        strict_min_version: "140.0",
        data_collection_permissions: {
          required: ["none"],
          optional: [],
        },
      },
      gecko_android: {
        strict_min_version: "142.0",
      },
    },
  },
});
