import express from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../controller/product.controller.js";
import { validate } from "../../../middleware/validation.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../validation/product.validation.js";

const router = express.Router();

router.post("/", validate(createProductSchema), createProductController);
router.get("/", getProductsController);
router.get("/:id", getProductByIdController);
router.patch("/:id", validate(updateProductSchema), updateProductController);
router.delete("/:id", deleteProductController);
export default router;
