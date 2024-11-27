import { describe, beforeEach, it, afterEach, expect, vi } from "vitest";
import prisma from "../db.js";
import {
  createUpdate,
  deleteUpdate,
  getOneUpdate,
  getUpdates,
  updateUpdate,
} from "../handlers/update.js";

vi.mock("../db.js", () => ({
  default: {
    update: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
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
describe("createUpdate", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      body: {
        productId: "test-product-id",
        title: "Test Update",
        body: "Test Body",
      },
    };
    mockRes = {
      json: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create update when product exists", async () => {
    const { productId, ...rest } = mockReq.body;
    const mockProduct = {
      id: "test-product-id",
      name: "Test Product",
    };
    const mockUpdate = {
      id: "new-update-id",
      ...mockReq.body,
    };

    (prisma.product.findUnique as any).mockResolvedValue(mockProduct);
    (prisma.update.create as any).mockResolvedValue(mockUpdate);

    await createUpdate(mockReq, mockRes);

    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: {
        id: "test-product-id",
      },
    });
    expect(prisma.update.create).toHaveBeenCalledWith({
      data: rest,
    });
    expect(mockRes.json).toHaveBeenCalledWith({
      data: mockUpdate,
    });
  });

  it("should return 'nope' message when product doesn't exist", async () => {
    (prisma.product.findUnique as any).mockResolvedValue(null);

    await createUpdate(mockReq, mockRes);

    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: {
        id: "test-product-id",
      },
    });
    expect(prisma.update.create).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "nope",
    });
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    (prisma.product.findUnique as any).mockRejectedValue(error);

    await expect(createUpdate(mockReq, mockRes)).rejects.toThrow(
      "Database error",
    );
  });
});

describe("updateUpdate", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      params: {
        id: "update-1",
      },
      user: {
        id: "user-123",
      },
      body: {
        title: "Updated Title",
        body: "Updated Body",
      },
    };
    mockRes = {
      json: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should update an existing update when user has access", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        updates: [{ id: "update-1", title: "Original Title" }],
      },
    ];

    const mockUpdatedUpdate = {
      id: "update-1",
      title: "Updated Title",
      body: "Updated Body",
    };

    (prisma.product.findMany as any).mockResolvedValue(mockProducts);
    (prisma.update.update as any).mockResolvedValue(mockUpdatedUpdate);

    await updateUpdate(mockReq, mockRes);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        belongsToId: "user-123",
      },
      include: {
        updates: true,
      },
    });

    expect(prisma.update.update).toHaveBeenCalledWith({
      where: {
        id: "update-1",
      },
      data: mockReq.body,
    });

    expect(mockRes.json).toHaveBeenCalledWith({
      data: mockUpdatedUpdate,
    });
  });

  it("should return 'nope' message when update not found", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        updates: [{ id: "different-update", title: "Original Title" }],
      },
    ];

    (prisma.product.findMany as any).mockResolvedValue(mockProducts);

    await updateUpdate(mockReq, mockRes);

    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(prisma.update.update).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "nope",
    });
  });

  it("should return 'nope' message when user has no products", async () => {
    (prisma.product.findMany as any).mockResolvedValue([]);

    await updateUpdate(mockReq, mockRes);

    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(prisma.update.update).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "nope",
    });
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    (prisma.product.findMany as any).mockRejectedValue(error);

    await expect(updateUpdate(mockReq, mockRes)).rejects.toThrow(
      "Database error",
    );
  });
});
describe("deleteUpdate", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      params: {
        id: "update-1",
      },
      user: {
        id: "user-123",
      },
    };
    mockRes = {
      json: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should delete an existing update when user has access", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        updates: [{ id: "update-1", title: "Update to Delete" }],
      },
    ];

    const mockDeletedUpdate = {
      id: "update-1",
      title: "Update to Delete",
    };

    (prisma.product.findMany as any).mockResolvedValue(mockProducts);
    (prisma.update.delete as any).mockResolvedValue(mockDeletedUpdate);

    await deleteUpdate(mockReq, mockRes);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        belongsToId: "user-123",
      },
      include: {
        updates: true,
      },
    });

    expect(prisma.update.delete).toHaveBeenCalledWith({
      where: {
        id: "update-1",
      },
    });

    expect(mockRes.json).toHaveBeenCalledWith({
      data: mockDeletedUpdate,
    });
  });

  it("should return 'nope' message when update not found", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        updates: [{ id: "different-update", title: "Different Update" }],
      },
    ];

    (prisma.product.findMany as any).mockResolvedValue(mockProducts);

    await deleteUpdate(mockReq, mockRes);

    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(prisma.update.delete).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "nope",
    });
  });

  it("should return 'nope' message when user has no products", async () => {
    (prisma.product.findMany as any).mockResolvedValue([]);

    await deleteUpdate(mockReq, mockRes);

    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(prisma.update.delete).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "nope",
    });
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    (prisma.product.findMany as any).mockRejectedValue(error);

    await expect(deleteUpdate(mockReq, mockRes)).rejects.toThrow(
      "Database error",
    );
  });
});
