const Inventory = require("../../models/inventoryModel");
const Product = require("../../models/productsModel");
const InventoryRepository = require("../../repositories/inventory");

const getAllInventories = async () => InventoryRepository.getAllInventories();

const getInventoryById = async (id) => InventoryRepository.getInventoryById(id);

const createInventory = async (data) =>
  InventoryRepository.createInventory(data);

const updateInventory = async (id, data) =>
  InventoryRepository.updateInventory(id, data);

const deleteInventory = async (id) => InventoryRepository.deleteInventory(id);

const getInventoryByProductId = async (productId) => {
  const inventory = await Inventory.findOne({ product_id: productId });
  return inventory;
};

const getProductsWithInventory = async (productIds) => {
  const products = await Product.find({ _id: { $in: productIds } });
  return await attachInventoryToProducts(products);
};

const attachInventoryToProducts = async (products) => {
  const productIds = products.map((product) => product._id);

  const inventories = await Inventory.find({
    product_id: { $in: productIds },
  });

  const inventoryMap = new Map();
  for (const inv of inventories) {
    inventoryMap.set(inv.product_id.toString(), inv.quantity);
  }

  const productsWithInventory = products.map((product) => {
    const productObj = product.toJSON();
    productObj.inventory = inventoryMap.get(product._id.toString()) || 0;
    return productObj;
  });

  return productsWithInventory;
};

const deleteInventoryByProductId = async (productId) => {
  const inventory = await InventoryRepository.getInventoryByProductId(
    productId
  );
  if (inventory) {
    await InventoryRepository.deleteInventory(inventory._id);
  }
};

module.exports = {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  attachInventoryToProducts,
  getInventoryByProductId,
  getProductsWithInventory,
  deleteInventoryByProductId,
};
