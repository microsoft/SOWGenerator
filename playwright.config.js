const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true
  },
  webServer: {
    command: 'node scripts/serve-static.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false
  }
});
