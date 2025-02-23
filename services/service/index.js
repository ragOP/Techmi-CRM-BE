const User = require("../../models/userModel.js");
const ServiceRepository = require("../../repositories/service/index.js");

const getAllServices = async () => {
  return await ServiceRepository.getAllServicesForSuperAdmins();
};

const getServiceById = async (id) => {
  return await ServiceRepository.getServiceById(id);
};

const createService = async (data) => {
  return await ServiceRepository.createService(data);
};

const updateService = async (id, data) => {
  return await ServiceRepository.updateService(id, data);
};

const deleteService = async (id) => {
  return await ServiceRepository.deleteService(id);
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
