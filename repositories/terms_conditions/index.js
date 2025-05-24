const TermsCondition = require("../../models/termsConditionModel");

const createTermsCondition = async (data) => {
  return await TermsCondition.create(data);
};

const updateTermsCondition = async (id, data) => {
  return await TermsCondition.findByIdAndUpdate(id, data, { new: true });
};

const getTermsCondition = async () => {
  return await TermsCondition.find();
};

module.exports = {
  createTermsCondition,
  updateTermsCondition,
  getTermsCondition,
};
