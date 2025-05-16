const Inventory = require("../../models/inventoryModel");

const getAllInventories = async () => Inventory.find();

const getInventoryById = async (id) => Inventory.findById(id);

const createInventory = async (data) => Inventory.create(data);

const updateInventory = async (id, data) =>
  Inventory.findByIdAndUpdate(id, data, { new: true });

const deleteInventory = async (id) => Inventory.findByIdAndDelete(id);

module.exports = {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
};
