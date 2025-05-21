const User = require("../../models/userModel.js");
const ServiceRepository = require("../../repositories/service/index.js");

const getAllServices = async ({
  search,
  page,
  per_page,
  start_date,
  end_date,
}) => {
  const filters = {
    ...(search && {
      name: {
        $regex: search,
        $options: "i",
      },
    }),
    ...(start_date || end_date
      ? {
          createdAt: {
            ...(start_date && { $gte: new Date(start_date) }),
            ...(end_date && { $lte: new Date(end_date) }),
          },
        }
      : {}),
  };
  console.log("filters", filters);
  return await ServiceRepository.getAllServices({ filters, page, per_page });
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
