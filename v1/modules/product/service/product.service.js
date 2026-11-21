import fs from "fs";
import Product from "../model/product.model.js";
import { AppError } from "../../../utils/AppError.js";
export const createProduct = async (data) => {
  if (!data.productSlug && data.name) {
    data.productSlug =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 50) +
      "-" +
      Date.now();
  }

  const existing = await Product.findOne({ productSlug: data.productSlug });
  if (existing) {
    return await Product.findByIdAndUpdate(existing._id, data, { new: true });
  }

  const product = await Product.create(data);
  return product;
};

export const getProducts = async (query = {}) => {
  const filter = {};

  if (query.source && query.source !== "all") {
    filter.$or = [
      { "sources.name": new RegExp(query.source, "i") },
      { "attributes.source_domain": new RegExp(query.source, "i") },
      { tags: new RegExp(query.source, "i") },
    ];
  }

  if (query.category && query.category !== "all") {
    const catRegex = new RegExp(query.category, "i");
    filter.$or = [
      ...(filter.$or || []),
      { categories: catRegex },
      { tags: catRegex },
    ];
  }

  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  if (query.imputed === "true") {
    filter["attributes.price_imputed"] = true;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  return products;
};

export const getProductBySlug = async (productSlug) => {
  const product = await Product.findOne({ productSlug });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const getMinedSites = async () => {
  const sites = await Product.aggregate([
    {
      $project: {
        domain: {
          $ifNull: [
            "$attributes.source_domain",
            { $arrayElemAt: ["$sources.name", 0] },
          ],
        },
        createdAt: 1,
      },
    },
    {
      $match: {
        domain: { $ne: null, $exists: true },
      },
    },
    {
      $group: {
        _id: "$domain",
        productCount: { $sum: 1 },
        lastMinedAt: { $max: "$createdAt" },
      },
    },
    {
      $project: {
        _id: 0,
        domain: "$_id",
        productCount: 1,
        lastMinedAt: 1,
      },
    },
    { $sort: { lastMinedAt: -1 } },
  ]);

  return sites;
};

const cleanupAnalyticsIfAffected = async (deletedDomain = null) => {
  try {
    const remaining = await Product.countDocuments();
    const backendAnalyticsPath =
      process.env.ANALYTICS_PATH || path.resolve(process.cwd(), "latest_analytics.json");
    const pythonAnalyticsPath =
      process.env.PYTHON_ANALYTICS_PATH ||
      (fs.existsSync(path.resolve(process.cwd(), "../data_mining_python/app/data/latest_analytics.json"))
        ? path.resolve(process.cwd(), "../data_mining_python/app/data/latest_analytics.json")
        : fs.existsSync(path.resolve(process.cwd(), "python/app/data/latest_analytics.json"))
        ? path.resolve(process.cwd(), "python/app/data/latest_analytics.json")
        : "e:\\Code\\data_mining_python\\app\\data\\latest_analytics.json");

    let shouldDelete = remaining === 0;

    if (!shouldDelete && deletedDomain && fs.existsSync(backendAnalyticsPath)) {
      try {
        const raw = fs.readFileSync(backendAnalyticsPath, "utf-8");
        const data = JSON.parse(raw);
        if (data?.sourceDomain?.toLowerCase() === deletedDomain.toLowerCase()) {
          shouldDelete = true;
        }
      } catch (_) {}
    }

    if (shouldDelete) {
      if (fs.existsSync(backendAnalyticsPath)) fs.unlinkSync(backendAnalyticsPath);
      if (fs.existsSync(pythonAnalyticsPath)) fs.unlinkSync(pythonAnalyticsPath);
    }
  } catch (err) {
    console.warn("Analytics cleanup error:", err.message);
  }
};

export const deleteProductsBySite = async (domain) => {
  if (!domain) {
    throw new AppError("Domain is required", 400);
  }

  const cleanDomain = domain.trim();
  const regex = new RegExp(`^${cleanDomain}$`, "i");

  const result = await Product.deleteMany({
    $or: [
      { "attributes.source_domain": regex },
      { "sources.name": regex },
      { tags: regex },
    ],
  });

  await cleanupAnalyticsIfAffected(cleanDomain);

  return {
    domain: cleanDomain,
    deletedCount: result.deletedCount,
  };
};

export const clearAllMinedProducts = async () => {
  const result = await Product.deleteMany({});
  await cleanupAnalyticsIfAffected(null);
  return {
    deletedCount: result.deletedCount,
  };
};
