const Blog = require("../../models/blogModel");

const createNewBlog = async (data) => {
  return await Blog.create(data);
};

const getAllBlogs = async (featured) => {
  if (featured) {
    return await Blog.find({ isFeatured: true });
  } else {
    return await Blog.find({});
  }
};

module.exports = {
  createNewBlog,
  getAllBlogs,
};
