const service = require("../../services/terms_condition/index");
const ApiResponse = require("../../utils/ApiResponse");

const createTermsCondition = async (req, res) => {
    const payload = {
      ...req.body,
    };
    const result = await service.createTermsCondition(payload);
    res.json(
    new ApiResponse(200, result, "Terms condition created successfully", true)
  );
};

const updateTermsCondition = async (req, res) => {
    const { id } = req.params;
    const result = await service.updateTermsCondition(id, req.body);
    res.json(
    new ApiResponse(200, result, "Terms condition updated successfully", true)
  );
};

const getLatestTermsCondition = async (req, res) => {
    const result = await service.getLatestTermsCondition();
    if (!result) {
      return res.json(new ApiResponse(404, null, "Terms condition not found", false));
    }
    res.json(new ApiResponse(200, result[0], "Terms condition fetched successfully", true));
};

module.exports = {
  createTermsCondition,
  updateTermsCondition,
  getLatestTermsCondition
};
