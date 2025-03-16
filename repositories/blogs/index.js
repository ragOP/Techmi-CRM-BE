const Blog = require("../../models/blogModel");

const createNewBlog = async (data) => {
  return await Blog.create(data);
};

const getAllBlogs = async (featured) => {
  const filter = featured ? { isFeatured: true } : {};
  return await Blog.find(filter);
};

const getSingleBlogById = async (id) => {
  return await Blog.findById(id);
};

const updateBlogById = async (id, data) => {
  return await Blog.findByIdAndUpdate(id, data, { new: true });
};

module.exports = {
  createNewBlog,
  getAllBlogs,
  getSingleBlogById,
  updateBlogById,
};
