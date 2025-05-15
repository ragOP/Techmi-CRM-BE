const Address = require("../../models/addressModel.js");
const AddressRepository = require("../../repositories/address/index.js");

const getAllAddresses = async () => {
  return await AddressRepository.getAllAddresses();
};

const getAddressById = async (id) => {
  return await AddressRepository.getAddressById(id);
};

const getAddressesByUserId = async (userId) => {
  return await AddressRepository.getAddressesByUserId(userId);
};

const createAddress = async (data) => {
  return await AddressRepository.createAddress(data);
};

const updateAddress = async (id, data) => {
  return await AddressRepository.updateAddress(id, data);
};

const deleteAddress = async (id) => {
  return await AddressRepository.deleteAddress(id);
};

const unsetPrimaryAddress = async (userId) => {
  await Address.updateMany(
    { user: userId, isPrimary: true },
    { isPrimary: false }
  );
};

module.exports = {
  getAllAddresses,
  getAddressById,
  getAddressesByUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  unsetPrimaryAddress,
};
