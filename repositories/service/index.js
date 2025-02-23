const Services = require("../../models/servicesModel");
const User = require("../../models/userModel");

const getAllServicesForSuperAdmins = async () => {
  const superAdmin = await User.findOne({ is_super_admin: true }).select("_id");
  console.log(superAdmin, ">>>> superAdmin", await User.find());
  if (!superAdmin) return [];

  return await Services.find({ created_by_admin: superAdmin._id });
};

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
  getAllServicesForSuperAdmins,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
