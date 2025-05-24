const repository = require("../../repositories/terms_conditions");

const createTermsCondition = async (payload) => {
  return await repository.createTermsCondition(payload);
};

const updateTermsCondition = async (id, payload) => {
  const existing = await repository.updateTermsCondition(id, payload);
  if (!existing) {
    throw new Error("Terms and Conditions not found");
  }
  return await repository.updateTermsCondition(id, payload);
};

const getLatestTermsCondition = async () => {
  return await repository.getTermsCondition();
};

module.exports = {
  createTermsCondition,
  updateTermsCondition,
  getLatestTermsCondition
};
