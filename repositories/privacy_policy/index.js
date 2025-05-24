const PrivacyPolicy = require("../../models/privacyPolicyModel");

const createPrivacyPolicy = async (data) => {
  return await PrivacyPolicy.create(data);
};

const updatePrivacyPolicy = async (id, data) => {
  return await PrivacyPolicy.findByIdAndUpdate(id, data, { new: true });
};

const getPrivacyPolicy = async () => {
  return await PrivacyPolicy.find();
};

module.exports = {
  createPrivacyPolicy,
  updatePrivacyPolicy,
  getPrivacyPolicy,
};