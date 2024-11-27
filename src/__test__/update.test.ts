import { describe, beforeEach, it, afterEach, expect, vi } from "vitest";
import prisma from "../db.js";
import { getOneUpdate } from "../handlers/update.js";

describe("getOneUpdate", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      params: {
        id: "test-id",
      },
    };
    mockRes = {
      json: vi.fn(),
    };
    vi.mock("../db.js", () => ({
      default: {
        update: {
          findUnique: vi.fn(),
        },
      },
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return update data when found", async () => {
    const mockUpdate = {
      id: "test-id",
      title: "Test Update",
      body: "Test Body",
    };

    (prisma.update.findUnique as any).mockResolvedValue(mockUpdate);

    await getOneUpdate(mockReq, mockRes);

    expect(prisma.update.findUnique).toHaveBeenCalledWith({
      where: {
        id: "test-id",
      },
    });
    expect(mockRes.json).toHaveBeenCalledWith({
      data: mockUpdate,
    });
  });

  it("should return null when update not found", async () => {
    (prisma.update.findUnique as any).mockResolvedValue(null);

    await getOneUpdate(mockReq, mockRes);

    expect(prisma.update.findUnique).toHaveBeenCalledWith({
      where: {
        id: "test-id",
      },
    });
    expect(mockRes.json).toHaveBeenCalledWith({
      data: null,
    });
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    (prisma.update.findUnique as any).mockRejectedValue(error);

    await expect(getOneUpdate(mockReq, mockRes)).rejects.toThrow(
      "Database error",
    );
  });
});
