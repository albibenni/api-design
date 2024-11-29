import { Router } from "express";
import { body, oneOf, validationResult } from "express-validator";
import {
  createProduct,
  deleteProduct,
  getOneProduct,
  getProducts,
} from "./handlers/product.js";
import {
  createUpdate,
  deleteUpdate,
  getOneUpdate,
  getUpdates,
  updateUpdate,
} from "./handlers/update.js";
import { handleInputErrors } from "./modules/middleware.js";

const router = Router();

/**
 * Product
 */
router.get("/product", getProducts);
router.get("/product/:id", getOneProduct);
router.put(
  "/product/:id",
  body("name").isString(),
  handleInputErrors,
  (req, res) => {},
);
router.post(
  "/product",
  body("name").isString(),
  handleInputErrors,
  createProduct,
);
router.delete("/product/:id", deleteProduct);

/**
 * Update
 */

router.get("/update", getUpdates);
router.get("/update/:id", getOneUpdate);
router.put(
  "/update/:id",
  body("title").optional(),
  body("body").optional(),
  body("status").isIn(["IN_PROGRESS", "SHIPPED", "DEPRECATED"]).optional(),
  body("version").optional(),
  updateUpdate,
);
router.post(
  "/update",
  body("title").exists().isString(),
  body("body").exists().isString(),
  body("productId").exists().isString(),
  createUpdate,
);
router.delete("/update/:id", deleteUpdate);

/**
 * Update Point
 */

router.get("/updatepoint", () => {});
router.get("/updatepoint/:id", () => {});
router.put(
  "/updatepoint/:id",
  body("name").optional().isString(),
  body("description").optional().isString(),
  () => {},
);
router.post(
  "/updatepoint",
  body("name").isString(),
  body("description").isString(),
  body("updateId").exists().isString(),
  () => {},
);
router.delete("/updatepoint/:id", () => {});

/**
 * Error handling
 *
 * same as server.ts - router level error handling - else wouldn't be caught
 */
router.use((err: any, req: any, res: any, next: any) => {
  if (err.type === "input") {
    res.status(400).json({ message: "invalid input" });
  } else if (err.type === "auth") {
    res.status(401).json({ message: "unauthorized" });
  } else {
    res.status(500).json({ message: "something went wrong" });
  }
});
export default router;
