import { vi, describe, afterAll, beforeEach, it, expect } from "vitest";

describe("file-ingestion", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });
  afterAll(() => {});

  it("env postgres", async () => {
    const POSTGRES_USER = "api";
    const POSTGRES_PASSWORD = "password";
    const POSTGRES_DB = "design";
    const POSTGRES_HOST = "localhost";
    const POSTGRES_PORT = "5430";
    const userP = process.env.POSTGRES_USER;
    const passP = process.env.POSTGRES_PASSWORD;
    const dbP = process.env.POSTGRES_DB;
    const hostP = process.env.POSTGRES_HOST;
    const portP = process.env.POSTGRES_PORT;
    expect(userP).toBe(POSTGRES_USER);
    expect(passP).toBe(POSTGRES_PASSWORD);
    expect(dbP).toBe(POSTGRES_DB);
    expect(hostP).toBe(POSTGRES_HOST);
    expect(portP).toBe(POSTGRES_PORT);
  });
});
