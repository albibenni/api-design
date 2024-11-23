/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { config } from "dotenv";

export default defineConfig({
  test: {
    // globalSetup: "./src/__tests__/global.setup.ts",
    passWithNoTests: true,
    globals: true,
    fileParallelism: false,
    poolOptions: {
      maxWorkers: 1,
    },
    env: {
      ...config({ path: "./.env" }).parsed,
    },
    root: "./src",
    onConsoleLog(log: string, type: "stdout" | "stderr"): false | void {
      console.log("log in test: ", log);
      if (log === "message from third party library" && type === "stdout") {
        return false;
      }
    },
  },
});
