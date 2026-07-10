import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Configurable Header Manager',
    version: '1.0.0',
    description: 'Add, modify, or remove HTTP request and response headers per URL pattern.',
    permissions: ['storage', 'declarativeNetRequest'],
    host_permissions: ['<all_urls>'],
    browser_specific_settings: {
      gecko: {
        id: 'header-manager@local',
        strict_min_version: '128.0',
      },
    },
  },
  suppressWarnings: {
    firefoxDataCollection: true,
  },
});
