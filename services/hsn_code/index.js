const HSNCodeRepository = require("../../repositories/hsn_code/index.js");

const getAllHSNCodes = async () => {
  const [data, total] = await Promise.all([
    HSNCodeRepository.findAll(),
    HSNCodeRepository.count(),
  ]);
  return { data, total };
};
const getHSNById = async (id) => HSNCodeRepository.findById(id);

const createHSNCode = async (data) => {
  const existing = await HSNCodeRepository.findOne({ hsn_code: data.hsn_code });
  if (existing) {
    throw new Error("HSN code already exists");
  }
  return await HSNCodeRepository.create(data);
};

const updateHSNCode = async (id, data) =>
  HSNCodeRepository.updateById(id, data);

const deleteHSNCode = async (id) => HSNCodeRepository.deleteById(id);

module.exports = {
  getAllHSNCodes,
  getHSNById,
  createHSNCode,
  updateHSNCode,
  deleteHSNCode,
};
