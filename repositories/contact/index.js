const ContactForm = require("../../models/contact");

const createNewForm = async (name, email, subject) => {
  return await ContactForm.create({
    name,
    email,
    subject,
  });
};

const getAllUserQueries = async () => {
  return await ContactForm.find({});
};

const deleteUserQueries = async (id) => {
  return await ContactForm.findByIdAndDelete(id);
};

module.exports = {
  createNewForm,
  getAllUserQueries,
  deleteUserQueries,
};
