const BrandRepository = require("../../repositories/brand");

const getAllBrandsWithCount = async ({ filters, page, per_page }) => {
  return await BrandRepository.getAllBrandsWithCount({
    filters,
    page,
    per_page,
  });
};

const getAllBrands = async () => BrandRepository.getAllBrands();

const getBrandById = async (id) => BrandRepository.getBrandById(id);

const createBrand = async (data) => BrandRepository.createBrand(data);

const updateBrand = async (id, data) => BrandRepository.updateBrand(id, data);

const deleteBrand = async (id) => BrandRepository.deleteBrand(id);

module.exports = {
  getAllBrandsWithCount,
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
