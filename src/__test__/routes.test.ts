import supertest from "supertest";
import route from "../server.js";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("GET /", () => {
  it("should return 200 and a message", async () => {
    const res = await supertest(route).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello World!" });
  });
});
