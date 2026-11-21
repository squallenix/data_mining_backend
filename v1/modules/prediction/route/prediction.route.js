import express from "express";
import {
  classifyProductController,
  predictPriceController,
  getPredictionAnalyticsController,
  getClassificationFeaturesController,
} from "../controller/prediction.controller.js";

const router = express.Router();

router.post("/classify", classifyProductController);
router.post("/price", predictPriceController);
router.get("/analytics", getPredictionAnalyticsController);
router.get("/features", getClassificationFeaturesController);

export default router;
