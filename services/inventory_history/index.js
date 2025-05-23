const InventoryHistoryRepository = require("../../repositories/inventory_history");

const createHistory = async (payload) => {
  return InventoryHistoryRepository.createHistory(payload);
};

const getHistoryByProduct = async (productId, options = {}) => {
  return InventoryHistoryRepository.getHistoryByProduct(productId, options);
};

const getHistoryByInventory = async (inventoryId, options = {}) => {
  return InventoryHistoryRepository.getHistoryByInventory(inventoryId, options);
};

const getAllHistory = async (filters = {}, options = {}) => {
  return InventoryHistoryRepository.getAllHistory(filters, options);
};

module.exports = {
  createHistory,
  getHistoryByProduct,
  getHistoryByInventory,
  getAllHistory,
};
