const service = require("../../services/privacy_policy");
const ApiResponse = require("../../utils/ApiResponse");

const createPrivacyPolicy = async (req, res) => {
    const payload = {
      ...req.body,
    };
    const result = await service.createPrivacyPolicy(payload);
    res.json(
    new ApiResponse(200, result, "Privacy Policy created successfully", true)
  );
};

const updatePrivacyPolicy = async (req, res) => {
    const { id } = req.params;
    const result = await service.updatePrivacyPolicy(id, req.body);
    res.json(
    new ApiResponse(200, result, "Privacy Policy updated successfully", true)
  );
};

const getLatestPrivacyPolicy = async (req, res) => {
    const result = await service.getLatestPrivacyPolicy();
    if (!result) {
      return res.json(new ApiResponse(404, null, "Privacy Policy not found", false));
    }
    res.json(new ApiResponse(200, result, "Privacy Policy fetched successfully", true));
};

module.exports = {
  createPrivacyPolicy,
  updatePrivacyPolicy,
  getLatestPrivacyPolicy
};
