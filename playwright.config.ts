import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/system",
  use: {
    baseURL: "http://localhost:5174",
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "vite --port 5174",
    url: "http://localhost:5174",
  },
});
