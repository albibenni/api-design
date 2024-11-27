import { describe, beforeEach, it, afterEach, expect, vi } from "vitest";
import prisma from "../db.js";
import { getOneUpdate, getUpdates } from "../handlers/update.js";

vi.mock("../db.js", () => ({
  default: {
    update: {
      findUnique: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

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

describe("getUpdates", () => {
  let mockReq2: any;
  let mockRes2: any;

  beforeEach(() => {
    mockReq2 = {
      user: {
        id: "user-123",
      },
    };
    mockRes2 = {
      json: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return all updates from user's products", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        updates: [
          { id: "update-1", title: "Update 1" },
          { id: "update-2", title: "Update 2" },
        ],
      },
      {
        id: "prod-2",
        updates: [{ id: "update-3", title: "Update 3" }],
      },
    ];

    (prisma.product.findMany as any).mockResolvedValue(mockProducts);

    await getUpdates(mockReq2, mockRes2);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        belongsToId: "user-123",
      },
      include: {
        updates: true,
      },
    });

    expect(mockRes2.json).toHaveBeenCalledWith({
      data: [
        { id: "update-1", title: "Update 1" },
        { id: "update-2", title: "Update 2" },
        { id: "update-3", title: "Update 3" },
      ],
    });
  });

  it("should return empty array when user has no products", async () => {
    (prisma.product.findMany as any).mockResolvedValue([]);

    await getUpdates(mockReq2, mockRes2);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        belongsToId: "user-123",
      },
      include: {
        updates: true,
      },
    });

    expect(mockRes2.json).toHaveBeenCalledWith({
      data: [],
    });
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    (prisma.product.findMany as any).mockRejectedValue(error);

    await expect(getUpdates(mockReq2, mockRes2)).rejects.toThrow(
      "Database error",
    );
  });
});
