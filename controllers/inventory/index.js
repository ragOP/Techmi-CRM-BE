const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse.js");
const InventoryService = require("../../services/inventory");
const { asyncHandler } = require("../../common/asyncHandler.js");

const getAllInventories = asyncHandler(async (req, res) => {
  const inventories = await InventoryService.getAllInventories();
  res.json(
    new ApiResponse(200, inventories, "Inventories fetched successfully", true)
  );
});

const getInventoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid inventory ID", false));
  }
  const inventory = await InventoryService.getInventoryById(id);
  if (!inventory) {
    return res.json(new ApiResponse(404, null, "Inventory not found", false));
  }
  res.json(
    new ApiResponse(200, inventory, "Inventory fetched successfully", true)
  );
});

const createInventory = asyncHandler(async (req, res) => {
  const inventory = await InventoryService.createInventory(req.body);
  res
    .status(201)
    .json(
      new ApiResponse(201, inventory, "Inventory created successfully", true)
    );
});

const updateInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid inventory ID", false));
  }
  const inventory = await InventoryService.updateInventory(id, req.body);
  if (!inventory) {
    return res.json(new ApiResponse(404, null, "Inventory not found", false));
  }
  res.json(
    new ApiResponse(200, inventory, "Inventory updated successfully", true)
  );
});

const deleteInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid inventory ID", false));
  }
  const inventory = await InventoryService.deleteInventory(id);
  if (!inventory) {
    return res.json(new ApiResponse(404, null, "Inventory not found", false));
  }
  res.json(new ApiResponse(200, null, "Inventory deleted successfully", true));
});

const checkInventoryForProducts = asyncHandler(async (req, res) => {
  const { product_ids } = req.body;
  if (!Array.isArray(product_ids) || product_ids.length === 0) {
    return res.json(
      new ApiResponse(400, null, "product_ids must be a non-empty array", false)
    );
  }

  const productsWithInventory = await InventoryService.getProductsWithInventory(
    product_ids
  );

  res.json(
    new ApiResponse(
      200,
      productsWithInventory,
      "Inventory fetched successfully",
      true
    )
  );
});

module.exports = {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  checkInventoryForProducts,
};
