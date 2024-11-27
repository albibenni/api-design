import prisma from "../db.js";

/**
 * Retrieves a single update record from the database by its ID
 * @param req - Express request object containing the update ID in params
 * @param res - Express response object used to send back the update data
 * @returns Promise that resolves to the update object wrapped in a data property
 * @throws Will throw if database query fails
 */
export const getOneUpdate = async (req: AuthRequest, res: Response) => {
  const update = await prisma.update.findUnique({
    where: {
      id: req.params.id,
    },
  });

  res.json({ data: update });
};

/**
 * Retrieves all updates for products belonging to the authenticated user
 *
 * @param req - Express request object containing authenticated user information
 * @param res - Express response object used to send JSON response
 * @returns Promise that resolves when updates are retrieved and sent
 *
 */
export const getUpdates = async (req: AuthRequest, res: Response) => {
  const products = await prisma.product.findMany({
    where: {
      belongsToId: req.user.id,
    },
    include: {
      updates: true,
    },
  });

  const updates = products.reduce((allUpdates, product) => {
    return [...allUpdates, ...product.updates];
  }, [] as any[]);

  res.json({ data: updates });
};

import { Request, Response } from "express";

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

/**
 * Creates a new update for a product in the database.
 *
 * @param req - The HTTP request object containing:
 *   - body.productId - The ID of the product to update
 *   - body.title - The title of the update
 *   - body.body - The body content of the update
 * @param res - The HTTP response object
 * @returns A JSON response containing either:
 *   - {data: Update} - The created update object on success
 *   - {message: "nope"} - If the product doesn't exist
 *
 * @throws Will throw if database operations fail
 */
export const createUpdate = async (req: Request, res: Response) => {
  const { productId, ...rest } = req.body;
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    return res.json({ message: "nope" });
  }

  const update = await prisma.update.create({
    data: rest,
  });

  res.json({ data: update });
};

/**
 * Updates an existing update record for a product.
 * First checks if the user has access to the update by finding all products and their updates belonging to the user.
 * If the update exists and belongs to one of user's products, it updates the record with new data.
 *
export const updateUpdate = async (req: AuthRequest, res: Response) => {
 * @param res - Express response object
 * @returns Promise resolving to JSON response with either updated data or error message
 *
 * @throws Will return error message if update is not found or user doesn't have access
 */
export const updateUpdate = async (req: AuthRequest, res: Response) => {
  const products = await prisma.product.findMany({
    where: {
      belongsToId: req.user.id,
    },
    include: {
      updates: true,
    },
  });

  const updates = products.reduce((allUpdates, product) => {
    return [...allUpdates, ...product.updates];
  }, [] as any[]);

  const match = updates.find((update) => update.id === req.params.id);

  if (!match) {
    return res.json({ message: "nope" });
  }

  const updatedUpdate = await prisma.update.update({
    where: {
      id: req.params.id,
    },
    data: req.body,
  });

  res.json({ data: updatedUpdate });
};

/**
 * Deletes an update associated with a user's product.
 *
 * @param req - Express request object containing user authentication and update ID
 * @param res - Express response object
 * @returns Promise that resolves with the deleted update data
 *
 * The function performs the following steps:
 * 1. Fetches all products belonging to the authenticated user
export const deleteUpdate = async (req: AuthRequest, res: Response) => {
 * 3. Validates that the requested update exists and belongs to the user
 * 4. Deletes the update from the database
 *
 * @throws Will return a "nope" message if the update is not found or doesn't belong to the user
 */
export const deleteUpdate = async (req: AuthRequest, res: Response) => {
  const products = await prisma.product.findMany({
    where: {
      belongsToId: req.user.id,
    },
    include: {
      updates: true,
    },
  });

  const updates = products.reduce((allUpdates, product) => {
    return [...allUpdates, ...product.updates];
  }, [] as any[]);

  const match = updates.find((update) => update.id === req.params.id);

  if (!match) {
    // handle this
    return res.json({ message: "nope" });
  }

  const deleted = await prisma.update.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json({ data: deleted });
};
