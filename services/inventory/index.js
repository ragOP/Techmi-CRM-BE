const InventoryRepository = require("../../repositories/inventory");

const getAllInventories = async () => InventoryRepository.getAllInventories();

const getInventoryById = async (id) => InventoryRepository.getInventoryById(id);

const createInventory = async (data) =>
  InventoryRepository.createInventory(data);

const updateInventory = async (id, data) =>
  InventoryRepository.updateInventory(id, data);

const deleteInventory = async (id) => InventoryRepository.deleteInventory(id);

module.exports = {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
};
