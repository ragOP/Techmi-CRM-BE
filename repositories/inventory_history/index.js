const InventoryHistory = require("../../models/inventoryHistoryModel");

const createHistory = (payload) => InventoryHistory.create(payload);

const getHistoryByProduct = (productId, options = {}) =>
  InventoryHistory.find({ product_id: productId, ...options.filters })
    .sort({ createdAt: -1 })
    .limit(options.limit || 100);

const getHistoryByInventory = (inventoryId, options = {}) =>
  InventoryHistory.find({ inventory_id: inventoryId, ...options.filters })
    .sort({ createdAt: -1 })
    .limit(options.limit || 100);

const getAllHistory = (filters = {}, options = {}) =>
  InventoryHistory.find(filters)
    .sort({ createdAt: -1 })
    .limit(options.limit || 100);

const countHistory = (filters = {}) => InventoryHistory.countDocuments(filters);

const deleteHistoryByProductId = (productId) =>
  InventoryHistory.deleteMany({ product_id: productId });

const deleteHistoryByInventoryId = (inventoryId) =>
  InventoryHistory.deleteMany({ inventory_id: inventoryId });

module.exports = {
  createHistory,
  getHistoryByProduct,
  getHistoryByInventory,
  getAllHistory,
  countHistory,
  deleteHistoryByProductId,
  deleteHistoryByInventoryId
};
