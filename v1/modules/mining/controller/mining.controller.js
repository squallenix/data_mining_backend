import {
  startMiningJob,
  getMiningStatus,
  getLatestAnalytics,
} from "../service/mining.service.js";

export const startMiningController = async (req, res, next) => {
  try {
    const { targetUrl, maxProducts = 30, features } = req.body;
    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        message: "targetUrl is required",
      });
    }

    const result = startMiningJob(targetUrl, maxProducts, features);
    return res.status(202).json({
      success: true,
      message: result.message,
      data: result.state,
    });
  } catch (error) {
    next(error);
  }
};

export const getMiningStatusController = async (req, res, next) => {
  try {
    const status = getMiningStatus();
    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const getMiningAnalyticsController = async (req, res, next) => {
  try {
    const analytics = getLatestAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
