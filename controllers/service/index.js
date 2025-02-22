const { asyncHandler } = require("../../common/asyncHandler.js");
const ApiResponse = require("../../utils/ApiResponse.js");
const ServiceRepository = require("../../repositories/service/index.js");
const mongoose = require("mongoose");

const getAllServices = asyncHandler(async (req, res) => {
  const services = await ServiceRepository.getAllServices();
  res.json(
    new ApiResponse(200, services, "Services fetched successfully", true)
  );
});

const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid service ID", false));
  }

  const service = await ServiceRepository.getServiceById(id);
  if (!service) {
    return res.json(new ApiResponse(404, null, "Service not found", false));
  }

  res.json(new ApiResponse(200, service, "Service fetched successfully", true));
});

const createService = asyncHandler(async (req, res) => {
  console.log(req.body)
  const service = await ServiceRepository.createService(req.body);
  res.json(new ApiResponse(201, service, "Service created successfully", true));
});

const updateService = asyncHandler(async (req, res) => {
  const service = await ServiceRepository.updateService(
    req.params.id,
    req.body
  );
  if (!service) {
    return res.json(new ApiResponse(404, null, "Service not found", false));
  }

  res.json(new ApiResponse(200, service, "Service updated successfully", true));
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await ServiceRepository.deleteService(req.params.id);
  if (!service) {
    return res.json(new ApiResponse(404, null, "Service not found", false));
  }

  res.json(new ApiResponse(200, null, "Service deleted successfully", true));
});

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
