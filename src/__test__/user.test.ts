import {
  describe,
  expect,
  vi,
  it,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import prisma from "../db.js";
import { createNewUser, signin } from "../handlers/user.js";
import { Request, Response, NextFunction } from "express";
import { hashPassword } from "../modules/auth.js";
import { afterEach } from "node:test";

describe("user handlers", () => {
  const mockReq = {
    body: {
      username: "testuser",
      password: "password123",
    },
  } as Request;

  const mockRes = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const mockNext = vi.fn() as NextFunction;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    try {
      await prisma.user.delete({
        where: {
          username: "testuser",
        },
      });
      await prisma.$disconnect();
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(async () => {
    try {
      await prisma.user.delete({
        where: {
          username: "testuser",
        },
      });
      vi.clearAllMocks();
    } catch (e) {
      console.log(e);
    }
  });

  afterEach(async () => {
    await prisma.user.delete({
      where: {
        username: "testuser",
      },
    });
    vi.clearAllMocks();
  });

  describe("createNewUser", () => {
    it("should create a new user and return JWT token", async () => {
      await createNewUser(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error if username already exists", async () => {
      await createNewUser(mockReq, mockRes, mockNext);
      await createNewUser(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "input",
        }),
      );
    });
  });

  describe("signin", () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          username: "testuser",
          password: await hashPassword("password123"),
        },
      });
    });

    it("should return JWT token for valid credentials", async () => {
      await signin(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
        }),
      );
    });

    it("should return 401 for invalid username", async () => {
      const invalidReq = {
        body: {
          username: "wronguser",
          password: "password123",
        },
      } as Request;

      await signin(invalidReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "nope" });
    });

    it("should return 401 for invalid password", async () => {
      const invalidReq = {
        body: {
          username: "testuser",
          password: "wrongpassword",
        },
      } as Request;

      await signin(invalidReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "nope" });
    });
  });
});
