const Services = require("../../models/servicesModel");

const getAllServices = async () => {
  return await Services.find();
};

const getServiceById = async (id) => {
  return await Services.findById(id);
};

const createService = async (data) => {
  return await Services.create(data);
};

const updateService = async (id, data) => {
  return await Services.findByIdAndUpdate(id, data, { new: true });
};

const deleteService = async (id) => {
  return await Services.findByIdAndDelete(id);
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
