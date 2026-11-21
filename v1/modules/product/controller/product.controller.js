import {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
  getMinedSites,
  deleteProductsBySite,
  clearAllMinedProducts,
} from "../service/product.service.js";

export const createProductController = async (req, res, next) => {
  try {
    const product = await createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsController = async (req, res, next) => {
  try {
    const products = await getProducts(req.query);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugController = async (req, res, next) => {
  try {
    const product = await getProductBySlug(
      req.params.productSlug,
    );

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdController = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const product = await updateProduct(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    await deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getMinedSitesController = async (req, res, next) => {
  try {
    const sites = await getMinedSites();
    res.status(200).json({
      success: true,
      data: sites,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductsBySiteController = async (req, res, next) => {
  try {
    const result = await deleteProductsBySite(req.params.domain);
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} products from ${result.domain}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const clearAllProductsController = async (req, res, next) => {
  try {
    const result = await clearAllMinedProducts();
    res.status(200).json({
      success: true,
      message: `Cleared all ${result.deletedCount} products from database`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};