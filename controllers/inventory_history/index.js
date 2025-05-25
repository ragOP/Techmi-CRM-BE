const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse");
const InventoryHistoryService = require("../../services/inventory_history");
const { asyncHandler } = require("../../common/asyncHandler");

const getAllHistory = asyncHandler(async (req, res) => {
  const {
    product_id,
    inventory_id,
    action,
    start_date,
    end_date,
    page = 1,
    per_page = 50,
  } = req.query;
  const filters = {};

  if (product_id && mongoose.Types.ObjectId.isValid(product_id)) {
    filters.product_id = product_id;
  }
  if (inventory_id && mongoose.Types.ObjectId.isValid(inventory_id)) {
    filters.inventory_id = inventory_id;
  }
  if (action) {
    filters.action = action;
  }
  if (start_date || end_date) {
    filters.createdAt = {};
    if (start_date) filters.createdAt.$gte = new Date(start_date);
    if (end_date) filters.createdAt.$lte = new Date(end_date);
  }

  const skip = (Number(page) - 1) * Number(per_page);
  const limit = Number(per_page);

  const [history, total] = await Promise.all([
    InventoryHistoryService.getAllHistory(filters, { skip, limit }),
    InventoryHistoryService.countHistory(filters),
  ]);

  res.json(
    new ApiResponse(
      200,
      { data: history, total, page: Number(page), per_page: Number(per_page) },
      "Inventory history fetched successfully",
      true
    )
  );
});

const getHistoryByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, per_page = 50, search = "" } = req.query;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.json(new ApiResponse(400, null, "Invalid product ID", false));
  }
  const skip = (Number(page) - 1) * Number(per_page);
  const limit = Number(per_page);

  const filters = { product_id: productId };
  if (search && search.trim() !== "") {
    filters.reason = { $regex: search, $options: "i" };
  }

  const [history, total] = await Promise.all([
    InventoryHistoryService.getAllHistory(filters, { skip, limit }),
    InventoryHistoryService.countHistory(filters),
  ]);

  res.json(
    new ApiResponse(
      200,
      { data: history, total, page: Number(page), per_page: Number(per_page) },
      "Product inventory history fetched successfully",
      true
    )
  );
});

const getHistoryByInventory = asyncHandler(async (req, res) => {
  const { inventoryId } = req.params;
  const { page = 1, per_page = 50 } = req.query;
  if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
    return res.json(new ApiResponse(400, null, "Invalid inventory ID", false));
  }
  const skip = (Number(page) - 1) * Number(per_page);
  const limit = Number(per_page);

  const [history, total] = await Promise.all([
    InventoryHistoryService.getHistoryByInventory(inventoryId, { skip, limit }),
    InventoryHistoryService.countHistory({ inventory_id: inventoryId }),
  ]);

  res.json(
    new ApiResponse(
      200,
      { data: history, total, page: Number(page), per_page: Number(per_page) },
      "Inventory history fetched successfully",
      true
    )
  );
});

module.exports = {
  getAllHistory,
  getHistoryByProduct,
  getHistoryByInventory,
};
