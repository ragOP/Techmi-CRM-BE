const HSNCode = require("../../models/hsncodeModel.js");

const findAll = (query) => HSNCode.find(query);

const findById = (id) => HSNCode.findById(id);

const findOne = (filter) => HSNCode.findOne(filter);

const create = (data) => HSNCode.create(data);

const updateById = (id, data) =>
  HSNCode.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteById = (id) => HSNCode.findByIdAndDelete(id);

const count = (query = {}) => HSNCode.countDocuments(query);

module.exports = {
  findAll,
  findById,
  findOne,
  create,
  updateById,
  deleteById,
  count,
};
