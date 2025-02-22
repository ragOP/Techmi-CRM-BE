const ServiceRepository = require("../../repositories/service/index.js");

const getAllServices = async () => {
  return await ServiceRepository.getAllServices();
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

export default {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
