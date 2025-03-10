const homepageRepo = require("../../repositories/home_config/index");

const getHomepageConfig = async () => {
  return await homepageRepo.getConfig();
};

const updateHomepageField = async (field, value) => {
  return await homepageRepo.updateField(field, value);
};

module.exports = { getHomepageConfig, updateHomepageField };
