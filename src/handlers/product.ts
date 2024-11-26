import prisma from "../db.js";

/**
 * Retrieves the products associated with the authenticated user.
 *
 * @param req - The request object, containing the authenticated user's information.
 * @param res - The response object used to send the response back to the client.
 *
 * @returns A JSON response containing the user's products if the user is found,
 *          otherwise a 404 status with a message indicating the user was not found.
 */
export const getProducts = async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    include: {
      products: true,
    },
  });
  if (!user) {
    res.status(404);
    res.json({ message: "nope" });
    return;
  }

  res.json({ data: user.products });
};

/**
 * Retrieves a single product by ID for the authenticated user
 * @param req - Express request object containing the product ID in params and user ID in the user object
 * @param res - Express response object used to send the JSON response
 * @returns Promise<void> - Sends a JSON response with the found product data
 * @throws Will throw if database query fails
 */
export const getOneProduct = async (req: any, res: any) => {
  const id = req.params.id;

  const product = await prisma.product.findFirst({
    where: {
      id,
      belongsToId: req.user.id,
    },
  });

  res.json({ data: product });
};

/**
 * Creates a new product in the database.
 *
 * @param req - Express request object containing the product name in body and user ID in the user object
 * @param res - Express response object
 * @returns Promise resolving to the JSON response containing the created product data
 *
 * @example
 * // Request body format
 * {
 *   "name": "Product Name"
 * }
 *
 * // Response format
 * {
 *   "data": {
 *     "id": "...",
 *     "name": "Product Name",
 *     "belongsToId": "user_id"
 *   }
 * }
 */
export const createProduct = async (req: any, res: any) => {
  const product = await prisma.product.create({
    data: {
      name: req.body.name,
      belongsToId: req.user.id,
    },
  });

  res.json({ data: product });
};

/**
 * Updates a product's information in the database
 * @param req - Express request object containing product ID in params and updated name in body
 * @param res - Express response object
 * @returns JSON response containing the updated product data
 * @throws Will throw an error if product is not found or user is not authorized
 */
export const updateProduct = async (req: any, res: any) => {
  const updated = await prisma.product.update({
    where: {
      id: req.params.id,
      belongsToId: req.user.id,
    },
    data: {
      name: req.body.name,
    },
  });

  res.json({ data: updated });
};

/**
 * Deletes a product from the database based on the provided ID
 * @param req - Express request object containing the product ID in params
 * @param res - Express response object
 * @returns Promise that resolves with the deleted product data in JSON format
 * @throws Will throw an error if the product ID doesn't exist in the database
 */
export const deleteProduct = async (req: any, res: any) => {
  const deleted = await prisma.product.delete({
    where: {
      id: req.params.id,
      belongsToId: req.user.id,
    },
  });

  res.json({ data: deleted });
};
