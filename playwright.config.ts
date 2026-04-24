import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "\"C:\\\\Program Files\\\\nodejs\\\\node.exe\" .\\\\node_modules\\\\next\\\\dist\\\\bin\\\\next dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120000
  }
});
