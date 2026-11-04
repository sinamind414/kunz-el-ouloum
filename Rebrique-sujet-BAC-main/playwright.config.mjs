import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true
  },
  webServer: {
    command: "node server.mjs --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI
  }
});
