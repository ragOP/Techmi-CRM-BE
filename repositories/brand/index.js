const Brand = require("../../models/brandModel");

const getAllBrands = async () => Brand.find();

const getAllBrandsWithCount = async ({ filters, page, per_page }) => {
  const [brands, total] = await Promise.all([
    Brand.find(filters)
      .skip((page - 1) * per_page)
      .limit(per_page)
      .sort({ createdAt: -1 }),
    Brand.countDocuments(filters),
  ]);
  return { brands, total };
};

const getBrandById = async (id) => Brand.findById(id);

const createBrand = async (data) => Brand.create(data);

const updateBrand = async (id, data) =>
  Brand.findByIdAndUpdate(id, data, { new: true });

const deleteBrand = async (id) => Brand.findByIdAndDelete(id);

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrandsWithCount,
};
