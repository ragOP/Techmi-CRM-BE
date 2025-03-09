const ContactForm = require("../../models/contact.js");
const ApiResponse = require("../../utils/ApiResponse.js");
const BlogRepositiories = require("../../repositories/blogs/index.js");

const addNewBlog = async (
    title,
    short_description,
    content,
    bannerImageUrl,
    category,
    isFeatured,
) => {
  const data = {
    title,
    short_description,
    content,
    bannerImageUrl,
    author: "admin",
    published: true,
    category,
    isFeatured,
  };
  let blogs = await BlogRepositiories.createNewBlog(data);
  if (!blogs) {
    throw new ApiResponse(400, null, "Form not submitted", false);
  }
  return blogs;
};

module.exports = {
    addNewBlog,
};
