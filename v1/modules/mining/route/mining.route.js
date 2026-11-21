import express from "express";
import {
  startMiningController,
  getMiningStatusController,
  getMiningAnalyticsController,
} from "../controller/mining.controller.js";

const router = express.Router();

router.post("/mine", startMiningController);
router.get("/status", getMiningStatusController);
router.get("/analytics", getMiningAnalyticsController);

export default router;
