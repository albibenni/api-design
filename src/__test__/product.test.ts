import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import prisma from "../db.js";
import {
  createProduct,
  deleteProduct,
  getOneProduct,
  getProducts,
  updateProduct,
} from "../handlers/product.js";

describe("getProducts", () => {
  beforeEach(() => {
    vi.mock("../db", () => ({
      default: {
        user: {
          findUnique: vi.fn(),
        },
        product: {
          findFirst: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      },
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it("should return the user's products if the user is found", async () => {
    const req = { user: { id: 1 } };
    const res = {
      status: vi.fn(),
      json: vi.fn(),
    };
    const user = {
      id: 1,
      products: [{ id: 1, name: "Product 1" }],
    };

    (prisma.user.findUnique as any).mockResolvedValue(user);

    await getProducts(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: req.user.id },
      include: { products: true },
    });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ data: user.products });
  });

  it("should return 404 if the user is not found", async () => {
    const req = { user: { id: 1 } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    (prisma.user.findUnique as any).mockResolvedValue(null);

    await getProducts(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: req.user.id },
      include: { products: true },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "nope" });
  });
});
describe("getOneProduct", () => {
  it("should return a single product for the authenticated user", async () => {
    const req = {
      user: { id: 1 },
      params: { id: "123" },
    };
    const res = {
      json: vi.fn(),
    };
    const product = {
      id: "123",
      belongsToId: "1",
      name: "Test Product",
      createdAt: new Date(),
    };

    vi.mocked(prisma.product.findFirst).mockResolvedValue(product);

    await getOneProduct(req, res);

    expect(prisma.product.findFirst).toHaveBeenCalledWith({
      where: {
        id: "123",
        belongsToId: 1,
      },
    });
    expect(res.json).toHaveBeenCalledWith({ data: product });
  });

  it("should return null if product is not found", async () => {
    const req = {
      user: { id: 1 },
      params: { id: "456" },
    };
    const res = {
      json: vi.fn(),
    };

    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

    await getOneProduct(req, res);

    expect(prisma.product.findFirst).toHaveBeenCalledWith({
      where: {
        id: "456",
        belongsToId: 1,
      },
    });
    expect(res.json).toHaveBeenCalledWith({ data: null });
  });
});

describe("createProduct", () => {
  it("should create a new product for the authenticated user", async () => {
    const req = {
      user: { id: 1 },
      body: { name: "New Product" },
    };
    const res = {
      json: vi.fn(),
    };
    const next = vi.fn();
    const newProduct = {
      id: "123",
      name: "New Product",
      belongsToId: "1",
      createdAt: new Date(),
    };

    vi.mocked(prisma.product.create).mockResolvedValue(newProduct);

    await createProduct(req, res, next);

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: "New Product",
        belongsToId: 1,
      },
    });
    expect(res.json).toHaveBeenCalledWith({ data: newProduct });
  });
});
describe("updateProduct", () => {
  it("should update an existing product", async () => {
    const req = {
      params: { id: "123" },
      body: { name: "Updated Product" },
      user: { id: 1 },
    };
    const res = {
      json: vi.fn(),
    };
    const updatedProduct = {
      id: "123",
      name: "Updated Product",
      belongsToId: "1",
      createdAt: new Date(),
    };

    vi.mocked(prisma.product.update).mockResolvedValue(updatedProduct);

    await updateProduct(req, res);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: {
        id: "123",
        belongsToId: 1,
      },
      data: {
        name: "Updated Product",
      },
    });
    expect(res.json).toHaveBeenCalledWith({ data: updatedProduct });
  });

  it("should throw an error if product is not found", async () => {
    const req = {
      params: { id: "456" },
      body: { name: "Updated Product" },
      user: { id: 1 },
    };
    const res = {
      json: vi.fn(),
    };

    vi.mocked(prisma.product.update).mockRejectedValue(
      new Error("Product not found"),
    );

    await expect(updateProduct(req, res)).rejects.toThrow("Product not found");
  });
});
describe("deleteProduct", () => {
  it("should delete an existing product", async () => {
    const req = {
      params: { id: "123" },
      user: { id: 1 },
    };
    const res = {
      json: vi.fn(),
    };
    const deletedProduct = {
      id: "123",
      name: "Product to Delete",
      belongsToId: "1",
      createdAt: new Date(),
    };

    vi.mocked(prisma.product.delete).mockResolvedValue(deletedProduct);

    await deleteProduct(req, res);

    expect(prisma.product.delete).toHaveBeenCalledWith({
      where: {
        id: "123",
        belongsToId: 1,
      },
    });
    expect(res.json).toHaveBeenCalledWith({ data: deletedProduct });
  });

  it("should throw an error if product is not found", async () => {
    const req = {
      params: { id: "456" },
      user: { id: 1 },
    };
    const res = {
      json: vi.fn(),
    };

    vi.mocked(prisma.product.delete).mockRejectedValue(
      new Error("Product not found"),
    );

    await expect(deleteProduct(req, res)).rejects.toThrow("Product not found");
  });
});
