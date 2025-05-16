const MedicineTypeRepository = require("../../repositories/medicine_type");

const getAllMedicineTypesWithCount = async () => {
  return await MedicineTypeRepository.getAllMedicineTypesWithCount();
};

const getAllMedicineTypes = async () => {
  return await MedicineTypeRepository.getAllMedicineTypes();
};

const getMedicineTypeById = async (id) => {
  return await MedicineTypeRepository.getMedicineTypeById(id);
};

const createMedicineType = async (data) => {
  const bodyName = data.name?.trim();
  const bodyDescription = data.description?.trim();

  if (!bodyName) {
    const err = new Error("Medicine type name is required");
    err.code = 400;
    throw err;
  }

  if (!bodyDescription) {
    const err = new Error("Medicine type description is required");
    err.code = 400;
    throw err;
  }

  const existing = await MedicineTypeRepository.findByName(bodyName);

  if (existing) {
    const err = new Error("Medicine type already exists");
    err.code = 409;
    throw err;
  }

  return await MedicineTypeRepository.createMedicineType({
    ...data,
    name: bodyName,
    description: bodyDescription,
  });
};

const updateMedicineType = async (id, data) => {
  return await MedicineTypeRepository.updateMedicineType(id, data);
};

const deleteMedicineType = async (id) => {
  return await MedicineTypeRepository.deleteMedicineType(id);
};

module.exports = {
  getAllMedicineTypes,
  getMedicineTypeById,
  createMedicineType,
  updateMedicineType,
  deleteMedicineType,
  getAllMedicineTypesWithCount,
};
