const MedicineType = require("../../models/medicineType");


const getAllMedicineTypesWithCount = async () => {
  const [types, total] = await Promise.all([
    MedicineType.find(),
    MedicineType.countDocuments()
  ]);
  return { types, total };
};

const getAllMedicineTypes = async () => MedicineType.find();

const getMedicineTypeById = async (id) => MedicineType.findById(id);

const createMedicineType = async (data) => MedicineType.create(data);

const updateMedicineType = async (id, data) =>
  MedicineType.findByIdAndUpdate(id, data, { new: true });

const deleteMedicineType = async (id) => MedicineType.findByIdAndDelete(id);

const findByName = async (name) => {
  return await MedicineType.findOne({ name });
}

const findById = async (id) => {
  return await MedicineType.findById(id);
}

module.exports = {
  getAllMedicineTypes,
  getMedicineTypeById,
  createMedicineType,
  updateMedicineType,
  deleteMedicineType,
  getAllMedicineTypesWithCount,
  findByName,
  findById
};
