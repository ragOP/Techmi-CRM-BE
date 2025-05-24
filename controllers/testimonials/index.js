const { asyncHandler } = require("../../common/asyncHandler");
const Testimonial = require("../../models/testimonialsModel");
const ApiResponse = require("../../utils/ApiResponse");
const { uploadSingleFile } = require("../../utils/upload");

const getAllTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, testimonials, "Testimonials fetched", true));
});

const createTestimonial = asyncHandler(async (req, res) => {
  let imageUrl = null;

  if (req.file) {
    imageUrl = await uploadSingleFile(req.file.path, "uploads/images");
  } else if (
    req.body.image &&
    (req.body.image.startsWith("http://") ||
      req.body.image.startsWith("https://") ||
      req.body.image.startsWith("/"))
  ) {
    imageUrl = req.body.image;
  }

  const { customer_name, message, rating } = req.body;
  const testimonial = await Testimonial.create({
    customer_name,
    message,
    rating,
    image: imageUrl,
  });
  res
    .status(201)
    .json(new ApiResponse(201, testimonial, "Testimonial created", true));
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let imageUrl = req.body.image;

  // If file uploaded, upload and get URL
  if (req.file) {
    imageUrl = await uploadSingleFile(req.file.path, "uploads/images");
  } else if (
    imageUrl &&
    !(
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("/")
    )
  ) {
    imageUrl = null;
  }

  const { customer_name, message, rating } = req.body;
  const updated = await Testimonial.findByIdAndUpdate(
    id,
    { customer_name, message, rating, image: imageUrl },
    { new: true }
  );
  if (!updated) {
    return res.json(new ApiResponse(404, null, "Testimonial not found", false));
  }
  res.json(new ApiResponse(200, updated, "Testimonial updated", true));
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Testimonial.findByIdAndDelete(id);
  if (!deleted) {
    return res.json(new ApiResponse(404, null, "Testimonial not found", false));
  }
  res.json(new ApiResponse(200, null, "Testimonial deleted", true));
});

module.exports = {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
