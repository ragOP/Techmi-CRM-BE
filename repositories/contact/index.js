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
}

module.exports = {
  createNewForm,
  getAllUserQueries
};
