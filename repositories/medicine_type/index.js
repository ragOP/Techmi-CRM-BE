const MedicineType = require("../../models/medicineType");

const getAllMedicineTypes = async () => MedicineType.find();

const getAllMedicineTypesWithCount = async ({ search }) => {
  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  const [types, total] = await Promise.all([
    MedicineType.find(filter),
    MedicineType.countDocuments(filter),
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
