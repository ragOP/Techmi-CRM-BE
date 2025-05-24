const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse.js");
const ProductsServices = require("../../services/product/index.js");
const { asyncHandler } = require("../../common/asyncHandler.js");
const {
  uploadMultipleFiles,
  uploadSingleFile,
  uploadPDF,
} = require("../../utils/upload/index.js");
const Product = require("../../models/productsModel.js");
const { convertToXLSX } = require("../../helpers/products/convertToXSLV.js");
const { convertToCSV } = require("../../helpers/products/convertToCSV.js");
const path = require("path");
const fs = require("fs/promises");
const os = require("os");

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    per_page = 10,
    price_range,
    service_id,
    category_id,
    is_best_seller,
    is_super_selling,
    is_most_ordered,
    search,
    sort_by = "created_at",
    start_date,
    end_date,
  } = req.query;

  const products = await ProductsServices.getAllProducts({
    page: parseInt(page, 10),
    per_page: parseInt(per_page, 10),
    service_id,
    category_id,
    is_best_seller,
    is_super_selling,
    is_most_ordered,
    search,
    price_range,
    sort_by,
    start_date,
    end_date,
  });
  res.json(
    new ApiResponse(200, products, "Products fetched successfully", true)
  );
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid product ID", false));
  }

  const product = await ProductsServices.getProductById(id);
  if (!product) {
    return res.json(new ApiResponse(404, null, "Product not found", false));
  }

  res.json(new ApiResponse(200, product, "Product fetched successfully", true));
});

const createProduct = asyncHandler(async (req, res) => {
  const images = req.files?.images || [];
  const bannerImageFile = req.files?.banner_image?.[0];

  if (!images.length && !bannerImageFile) {
    return res.json(new ApiResponse(404, null, "No Images Found", false));
  }

  const imageUrls = images.length
    ? await uploadMultipleFiles(images, "uploads/images")
    : [];

  const bannerImageUrl = await uploadSingleFile(
    bannerImageFile.path,
    "uploads/images"
  );

  let { meta_data } = req.body;

  if (meta_data) {
    try {
      meta_data = JSON.parse(meta_data);
    } catch (error) {
      return res.json(
        new ApiResponse(400, null, "Invalid meta_data format", false)
      );
    }
  }

  const productData = {
    ...req.body,
    images: imageUrls,
    banner_image: bannerImageUrl,
    meta_data,
  };

  const createdByAdmin = req.body.created_by_admin;

  const product = await ProductsServices.createProduct(
    productData,
    createdByAdmin
  );
  res.json(new ApiResponse(201, product, "Product created successfully", true));
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id);

  if (!product) {
    return res.json(new ApiResponse(404, null, "Product not found", false));
  }

  const images = req.files?.images || [];
  const bannerImageFile = req.files?.banner_image?.[0];

  const imageUrls = images.length
    ? await uploadMultipleFiles(images, "uploads/images")
    : [];

  const bannerImageUrl = await uploadSingleFile(
    bannerImageFile.path,
    "uploads/images"
  );

  let { meta_data } = req.body;

  if (meta_data) {
    try {
      meta_data = JSON.parse(meta_data);
    } catch (error) {
      return res.json(
        new ApiResponse(400, null, "Invalid meta_data format", false)
      );
    }
  }

  const productData = {
    ...req.body,
    images: imageUrls,
    banner_image: bannerImageUrl,
    meta_data,
  };

  const createdByAdmin = req.body.created_by_admin;

  const updatedProduct = await ProductsServices.updateProduct(
    id,
    productData,
    createdByAdmin
  );

  res.json(
    new ApiResponse(200, updatedProduct, "Product updated successfully", true)
  );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await ProductsServices.deleteProduct(req.params.id);
  if (!product) {
    return res.json(new ApiResponse(404, null, "Product not found", false));
  }

  res.json(new ApiResponse(200, null, "Product deleted successfully", true));
});

const getProductsByAdmin = asyncHandler(async (req, res) => {
  const adminId = req.admin._id;
  if (!adminId) {
    return res.json(new ApiResponse(404, null, "Admin not found", false));
  }

  const { page = 1, per_page = 10, search, start_date, end_date } = req.query;

  const { products, total } = await ProductsServices.getProductsByAdmin({
    id: adminId,
    page,
    per_page,
    search,
    start_date,
    end_date,
  });

  const data = {
    data: products,
    total: total,
  };

  res.json(new ApiResponse(200, data, "Product fetched successfully", true));
});

const bulkCreateProducts = asyncHandler(async (req, res) => {
  const products = req.body;
  const adminId = req.admin._id;

  if (!adminId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Admin not found", false));
  }

  if (!products?.length) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "No products provided", false));
  }

  const result = await ProductsServices.bulkCreateProducts(products, adminId);

  res
    .status(207)
    .json(new ApiResponse(207, result, "Batch processing completed", true));
});

const exportProducts = asyncHandler(async (req, res) => {
  const fileType = req.query.fileType?.toLowerCase() || "xlsx";
  const startDate = req.query.start_date
    ? new Date(req.query.start_date)
    : null;
  const endDate = req.query.end_date ? new Date(req.query.end_date) : null;

  const filter = {};
  if (startDate && endDate) {
    filter.createdAt = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    filter.createdAt = { $gte: startDate };
  } else if (endDate) {
    filter.createdAt = { $lte: endDate };
  }

  const products = await Product.find(filter).lean();
  const serializedProducts = products.map((p) => {
    const { __v, _id, createdAt, updatedAt, ...rest } = p;
    return {
      id: p._id.toString(),
      createdAt: createdAt?.toISOString(),
      updatedAt: updatedAt?.toISOString(),
      ...rest,
    };
  });

  let buffer;
  let mimeType = "";
  let filename = `products_${Date.now()}.${fileType}`;

  if (fileType === "csv") {
    const content = convertToCSV(serializedProducts);
    buffer = Buffer.from(content, "utf-8");
    mimeType = "text/csv";
  } else if (fileType === "xlsx") {
    buffer = convertToXLSX(serializedProducts);
    mimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Unsupported file type", false));
  }

  // Write buffer to a temp file
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, filename);
  await fs.writeFile(tempFilePath, buffer);

  // Upload to Cloudinary
  const url = await uploadPDF(tempFilePath, "exports");

  console.log("Cloudinary File URL:", url);

  // Respond with the Cloudinary URL
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { url, mimeType, filename },
        "Products exported and uploaded successfully",
        true
      )
    );
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByAdmin,
  bulkCreateProducts,
  exportProducts,
};
