const {
  getPharmaInternalPage,
  updatePharmaInternalPage,
} = require("../../repositories/internal_config/index");

const fetchPharmaInternalPage = async () => {
  return await getPharmaInternalPage();
};

const modifyPharmaInternalPage = async (field, value) => {
  return await updatePharmaInternalPage(field, value);
};

module.exports = { fetchPharmaInternalPage, modifyPharmaInternalPage };
