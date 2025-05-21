const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse.js");
const MedicineTypeService = require("../../services/medicine_type");
const { asyncHandler } = require("../../common/asyncHandler.js");

const getAllMedicineTypes = asyncHandler(async (req, res) => {
  const { search, start_date, end_date } = req.query;

  const filters = {
    ...(search && { code: { $regex: search, $options: "i" } }),
    ...(start_date || end_date
      ? {
          createdAt: {
            ...(start_date && { $gte: new Date(start_date) }),
            ...(end_date && { $lte: new Date(end_date) }),
          },
        }
      : {}),
  };

  const { types, total } =
    await MedicineTypeService.getAllMedicineTypesWithCount({ filters });
  res.json(
    new ApiResponse(
      200,
      { data: types, total },
      "Medicine types fetched successfully",
      true
    )
  );
});

const getMedicineTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid medicine type ID", false)
    );
  }
  const type = await MedicineTypeService.getMedicineTypeById(id);
  if (!type) {
    return res.json(
      new ApiResponse(404, null, "Medicine type not found", false)
    );
  }
  res.json(
    new ApiResponse(200, type, "Medicine type fetched successfully", true)
  );
});

const createMedicineType = asyncHandler(async (req, res) => {
  const type = await MedicineTypeService.createMedicineType({
    ...req.body,
    created_by_admin: req.admin?._id,
  });
  res
    .status(201)
    .json(
      new ApiResponse(201, type, "Medicine type created successfully", true)
    );
});

const updateMedicineType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid medicine type ID", false)
    );
  }
  const type = await MedicineTypeService.updateMedicineType(id, req.body);
  if (!type) {
    return res.json(
      new ApiResponse(404, null, "Medicine type not found", false)
    );
  }
  res.json(
    new ApiResponse(200, type, "Medicine type updated successfully", true)
  );
});

const deleteMedicineType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid medicine type ID", false)
    );
  }
  const type = await MedicineTypeService.deleteMedicineType(id);
  if (!type) {
    return res.json(
      new ApiResponse(404, null, "Medicine type not found", false)
    );
  }
  res.json(
    new ApiResponse(200, null, "Medicine type deleted successfully", true)
  );
});

module.exports = {
  getAllMedicineTypes,
  getMedicineTypeById,
  createMedicineType,
  updateMedicineType,
  deleteMedicineType,
};
