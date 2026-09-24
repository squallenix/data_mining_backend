import Joi from "joi";

const imageSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    "string.empty": "Image URL is required",
    "string.uri": "Image URL must be a valid URL",
    "any.required": "Image URL is required",
  }),

  alt: Joi.string().allow("").default("").messages({
    "string.base": "Image alt text must be a string",
  }),

  isPrimary: Joi.boolean().default(false).messages({
    "boolean.base": "Image primary status must be true or false",
  }),

  sortOrder: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Image sort order must be a number",
    "number.integer": "Image sort order must be an integer",
    "number.min": "Image sort order cannot be negative",
  }),
});

const variantSchema = Joi.object({
  sku: Joi.string().allow("").messages({
    "string.base": "Variant SKU must be a string",
  }),

  name: Joi.string().allow("").messages({
    "string.base": "Variant name must be a string",
  }),

  attributes: Joi.object().default({}).messages({
    "object.base": "Variant attributes must be an object",
  }),

  price: Joi.number().min(0).required().messages({
    "number.base": "Variant price must be a number",
    "number.min": "Variant price cannot be negative",
    "any.required": "Variant price is required",
  }),

  compareAtPrice: Joi.number().min(0).allow(null).messages({
    "number.base": "Variant compare-at price must be a number",
    "number.min": "Variant compare-at price cannot be negative",
  }),

  costPrice: Joi.number().min(0).allow(null).messages({
    "number.base": "Variant cost price must be a number",
    "number.min": "Variant cost price cannot be negative",
  }),

  stock: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Variant stock must be a number",
    "number.integer": "Variant stock must be an integer",
    "number.min": "Variant stock cannot be negative",
  }),

  lowStockThreshold: Joi.number().integer().min(0).default(5).messages({
    "number.base": "Variant low stock threshold must be a number",
    "number.integer": "Variant low stock threshold must be an integer",
    "number.min": "Variant low stock threshold cannot be negative",
  }),

  images: Joi.array().items(imageSchema).default([]).messages({
    "array.base": "Variant images must be an array",
  }),

  isActive: Joi.boolean().default(true).messages({
    "boolean.base": "Variant active status must be true or false",
  }),
});

const sourceSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Source name must be a string",
    "string.empty": "Source name is required",
    "any.required": "Source name is required",
  }),

  externalId: Joi.string().allow("").messages({
    "string.base": "Source external ID must be a string",
  }),

  url: Joi.string().uri().allow("").messages({
    "string.base": "Source URL must be a string",
    "string.uri": "Source URL must be a valid URL",
  }),

  lastSyncedAt: Joi.date().allow(null).messages({
    "date.base": "Last synced date must be a valid date",
  }),
});

export const createProductSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Product name must be a string",
    "string.empty": "Product name is required",
    "any.required": "Product name is required",
  }),

  productSlug: Joi.string()
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.base": "Product slug must be a string",
      "string.empty": "Product slug is required",
      "any.required": "Product slug is required",
    }),

  tags: Joi.array().items(Joi.string().trim().max(50)).default([]).messages({
    "array.base": "Tags must be an array of strings",
    "string.base": "Tag must be a string",
  }),

  description: Joi.string().allow("").default("").messages({
    "string.base": "Product description must be a string",
  }),

  shortDescription: Joi.string().allow("").default("").messages({
    "string.base": "Short description must be a string",
  }),

  brand: Joi.string().allow(null).messages({
    "string.base": "Brand ID must be a string",
  }),

  categories: Joi.array().items(Joi.string()).default([]).messages({
    "array.base": "Categories must be an array",
    "string.base": "Category ID must be a string",
  }),

  sku: Joi.string().allow("").messages({
    "string.base": "SKU must be a string",
  }),

  barcode: Joi.string().allow("").messages({
    "string.base": "Barcode must be a string",
  }),

  mpn: Joi.string().allow("").messages({
    "string.base": "MPN must be a string",
  }),

  gtin: Joi.string().allow("").messages({
    "string.base": "GTIN must be a string",
  }),

  price: Joi.number().min(0).required().messages({
    "number.base": "Product price must be a number",
    "number.min": "Product price cannot be negative",
    "any.required": "Product price is required",
  }),

  compareAtPrice: Joi.number().min(0).allow(null).messages({
    "number.base": "Compare-at price must be a number",
    "number.min": "Compare-at price cannot be negative",
  }),

  currency: Joi.string().default("BDT").messages({
    "string.base": "Currency must be a string",
  }),

  stock: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock cannot be negative",
  }),

  lowStockThreshold: Joi.number().integer().min(0).default(5).messages({
    "number.base": "Low stock threshold must be a number",
    "number.integer": "Low stock threshold must be an integer",
    "number.min": "Low stock threshold cannot be negative",
  }),

  trackInventory: Joi.boolean().default(true).messages({
    "boolean.base": "Track inventory must be true or false",
  }),

  allowBackorder: Joi.boolean().default(false).messages({
    "boolean.base": "Allow backorder must be true or false",
  }),

  images: Joi.array().items(imageSchema).default([]).messages({
    "array.base": "Images must be an array",
  }),

  specifications: Joi.object().default({}).messages({
    "object.base": "Specifications must be an object",
  }),

  attributes: Joi.object().default({}).messages({
    "object.base": "Attributes must be an object",
  }),

  hasVariants: Joi.boolean().default(false).messages({
    "boolean.base": "Has variants must be true or false",
  }),

  variants: Joi.array().items(variantSchema).default([]).messages({
    "array.base": "Variants must be an array",
  }),

  weight: Joi.object({
    value: Joi.number().min(0).allow(null).messages({
      "number.base": "Weight value must be a number",
      "number.min": "Weight cannot be negative",
    }),

    unit: Joi.string().valid("g", "kg", "oz", "lb").default("kg").messages({
      "any.only": "Weight unit must be one of: g, kg, oz, lb",
    }),
  })
    .allow(null)
    .messages({
      "object.base": "Weight must be an object",
    }),

  dimensions: Joi.object({
    length: Joi.number().min(0).allow(null).messages({
      "number.base": "Length must be a number",
      "number.min": "Length cannot be negative",
    }),

    width: Joi.number().min(0).allow(null).messages({
      "number.base": "Width must be a number",
      "number.min": "Width cannot be negative",
    }),

    height: Joi.number().min(0).allow(null).messages({
      "number.base": "Height must be a number",
      "number.min": "Height cannot be negative",
    }),

    unit: Joi.string().valid("cm", "m", "in").default("cm").messages({
      "any.only": "Dimension unit must be one of: cm, m, in",
    }),
  })
    .allow(null)
    .messages({
      "object.base": "Dimensions must be an object",
    }),

  requiresShipping: Joi.boolean().default(true).messages({
    "boolean.base": "Requires shipping must be true or false",
  }),

  shippingClass: Joi.string().allow(null, "").messages({
    "string.base": "Shipping class must be a string",
  }),

  status: Joi.string()
    .valid("draft", "active", "archived")
    .default("draft")
    .messages({
      "any.only": "Status must be one of: draft, active, archived",
    }),

  isVisible: Joi.boolean().default(true).messages({
    "boolean.base": "Visibility must be true or false",
  }),

  seo: Joi.object({
    title: Joi.string().allow("").messages({
      "string.base": "SEO title must be a string",
    }),

    description: Joi.string().allow("").messages({
      "string.base": "SEO description must be a string",
    }),

    keywords: Joi.array()
      .items(
        Joi.string().messages({
          "string.base": "SEO keyword must be a string",
        }),
      )
      .default([])
      .messages({
        "array.base": "SEO keywords must be an array",
      }),
  }).messages({
    "object.base": "SEO must be an object",
  }),

  rating: Joi.object({
    average: Joi.number().min(0).max(5).default(0).messages({
      "number.base": "Rating average must be a number",
      "number.min": "Rating average cannot be below 0",
      "number.max": "Rating average cannot exceed 5",
    }),

    count: Joi.number().integer().min(0).default(0).messages({
      "number.base": "Rating count must be a number",
      "number.integer": "Rating count must be an integer",
      "number.min": "Rating count cannot be negative",
    }),
  }).messages({
    "object.base": "Rating must be an object",
  }),

  sources: Joi.array().items(sourceSchema).default([]).messages({
    "array.base": "Sources must be an array",
  }),
});

export const updateProductSchema = createProductSchema.fork(
  ["name", "productSlug", "price"],
  (schema) => schema.optional(),
);
