const repository = require("../../repositories/privacy_policy");

const createPrivacyPolicy = async (payload) => {
  return await repository.createPrivacyPolicy(payload);
};

const updatePrivacyPolicy = async (id, payload) => {
  const existing = await repository.updatePrivacyPolicy(id, payload);
  if (!existing) {
    throw new Error("Privacy Policy not found");
  }
  return await repository.updatePrivacyPolicy(id, payload);
};

const getLatestPrivacyPolicy = async () => {
  return await repository.getPrivacyPolicy();
};

module.exports = {
  createPrivacyPolicy,
  updatePrivacyPolicy,
  getLatestPrivacyPolicy
};
