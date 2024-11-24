import { describe, it, expect } from "vitest";
import { comparePasswords, hashPassword } from "../modules/auth.js";
import bcrypt from "bcrypt";

describe("comparePasswords", () => {
  it("should return true for matching passwords", async () => {
    const password = "password123";
    const hash = await bcrypt.hash(password, 5);
    const result = await comparePasswords(password, hash);
    expect(result).toBe(true);
  });

  it("should return false for non-matching passwords", async () => {
    const password = "password123";
    const hash = await bcrypt.hash("differentPassword", 5);
    const result = await comparePasswords(password, hash);
    expect(result).toBe(false);
  });

  it("should return false for empty password", async () => {
    const password = "";
    const hash = await bcrypt.hash("password123", 5);
    const result = await comparePasswords(password, hash);
    expect(result).toBe(false);
  });

  it("should return false for empty hash", async () => {
    const password = "password123";
    const hash = "";
    const result = await comparePasswords(password, hash);
    expect(result).toBe(false);
  });
});

describe("hashPassword", () => {
  it("should return a hashed password", async () => {
    const password = "password123";
    const hash = await hashPassword(password);
    const result = await bcrypt.compare(password, hash);
    expect(result).toBe(true);
  });

  it("should return different hashes for different passwords", async () => {
    const password1 = "password123";
    const password2 = "differentPassword";
    const hash1 = await hashPassword(password1);
    const hash2 = await hashPassword(password2);
    expect(hash1).not.toBe(hash2);
  });

  it("should return different hashes for the same password", async () => {
    const password = "password123";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });
});
