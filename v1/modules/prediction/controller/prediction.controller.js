import {
  classifyProduct,
  predictProductPrice,
  getPredictionAnalytics,
  getClassificationFeatures,
} from "../service/prediction.service.js";

export const classifyProductController = async (req, res, next) => {
  try {
    const result = await classifyProduct(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const predictPriceController = async (req, res, next) => {
  try {
    const result = await predictProductPrice(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPredictionAnalyticsController = async (req, res, next) => {
  try {
    const analytics = await getPredictionAnalytics();
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

export const getClassificationFeaturesController = async (req, res, next) => {
  try {
    const data = await getClassificationFeatures();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
