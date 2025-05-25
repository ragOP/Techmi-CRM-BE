const MedicineType = require("../../models/medicineType");

const getAllMedicineTypes = async () => MedicineType.find();

const getAllMedicineTypesWithCount = async ({ filters, page, per_page }) => {
  const [types, total] = await Promise.all([
    MedicineType.find(filters)
      .skip((page - 1) * per_page)
      .limit(per_page)
      .sort({ createdAt: -1 }),
    MedicineType.countDocuments(filters),
  ]);
  return { types, total };
};

const getMedicineTypeById = async (id) => MedicineType.findById(id);

const createMedicineType = async (data) => MedicineType.create(data);

const updateMedicineType = async (id, data) =>
  MedicineType.findByIdAndUpdate(id, data, { new: true });

const deleteMedicineType = async (id) => MedicineType.findByIdAndDelete(id);

const findByName = async (name) => {
  return await MedicineType.findOne({ name });
};

const findById = async (id) => {
  return await MedicineType.findById(id);
};

module.exports = {
  getAllMedicineTypes,
  getMedicineTypeById,
  createMedicineType,
  updateMedicineType,
  deleteMedicineType,
  getAllMedicineTypesWithCount,
  findByName,
  findById,
};
