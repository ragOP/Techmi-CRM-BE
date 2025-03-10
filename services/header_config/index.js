const homepageRepo = require("../../repositories/header_config/index");

const getHeaderConfig = async () => {
  return await homepageRepo.getConfig();
};

const updateHeaderField = async (field, value) => {
  return await homepageRepo.updateField(field, value);
};

module.exports = { getHeaderConfig, updateHeaderField };
