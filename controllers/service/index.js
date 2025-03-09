const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse.js");
const ServiceServices = require("../../services/service/index.js");
const { asyncHandler } = require("../../common/asyncHandler.js");
const { uploadMultipleFiles } = require("../../utils/upload/index.js");

const getAllServices = asyncHandler(async (req, res) => {
  const services = await ServiceServices.getAllServices();
  res.json(
    new ApiResponse(200, services, "Services fetched successfully", true)
  );
});

const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid service ID", false));
  }

  const service = await ServiceServices.getServiceById(id);
  if (!service) {
    return res.json(new ApiResponse(404, null, "Service not found", false));
  }

  res.json(new ApiResponse(200, service, "Service fetched successfully", true));
});

const createService = asyncHandler(async (req, res) => {
  const images = req.files;
  console.log("> 11111", images);

  if (!images) {
    return res.json(new ApiResponse(404, null, "No Image Found", false));
  }
  const imageUrls = await uploadMultipleFiles(images, "uploads/images");

  let serviceData = { ...req.body, images: imageUrls };
  if (serviceData?.meta_data) {
    serviceData.meta_data = JSON.parse(serviceData.meta_data);
  }

  console.log("> 11111", serviceData);

  const service = await ServiceServices.createService(serviceData);
  console.log("> service", service);
  res.json(new ApiResponse(200, service, "Service created successfully", true));
});

const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid service ID", false));
  }

  let serviceData = { ...req.body };

  if (req.files) {
    const imageUrls = await uploadMultipleFiles(req.files, "uploads/images");
    serviceData.images = imageUrls;
  }

  if (serviceData?.meta_data) {
    try {
      serviceData.meta_data = JSON.parse(serviceData.meta_data);
    } catch (error) {
      return res.json(
        new ApiResponse(400, null, "Invalid meta_data format", false)
      );
    }
  }

  const updatedService = await ServiceServices.updateService(id, serviceData);

  if (!updatedService) {
    return res.json(new ApiResponse(404, null, "Service not found", false));
  }

  res.json(
    new ApiResponse(200, updatedService, "Service updated successfully", true)
  );
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await ServiceServices.deleteService(req.params.id);
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
