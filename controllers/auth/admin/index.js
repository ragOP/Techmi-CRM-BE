const { asyncHandler } = require("../../../common/asyncHandler");
const Admin = require("../../../models/adminModel");
const Services = require("../../../models/servicesModel");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  generateAccessToken,
  // generateRefreshToken,
} = require("../../../utils/auth");

const getAllAdmins = asyncHandler(async (req, res) => {
  const { search = "", page = 1, per_page = 50, start_date, end_date } = req.query;

  const superAdminId = req.admin._id;

  if (!superAdminId) {
    return res.json(new ApiResponse(404, null, "Not authorized"));
  }

  const query = { role: "admin" };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (start_date || end_date) {
    query.createdAt = {
      ...(start_date && { $gte: new Date(start_date) }),
      ...(end_date && { $lte: new Date(end_date) }),
    };
  }

  const skip = (page - 1) * per_page;

  const admins = await Admin.find(query)
    .select("-password")
    .populate("services")
    .skip(skip)
    .limit(parseInt(per_page, 10));

  const totalAdmins = await Admin.countDocuments(query);

  res.json(
    new ApiResponse(
      200,
      { data: admins, total: totalAdmins },
      "Admins fetched successfully",
      true
    )
  );
});

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role, services } = req.body;
  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Admin already exists", false));
  }

  let validServices = [];
  if (services?.length) {
    validServices = await Services.find({ _id: { $in: services } });
    if (validServices.length !== services.length) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Invalid service IDs provided", false)
        );
    }
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    role,
    services: validServices.map((service) => service._id),
  });

  const accessToken = generateAccessToken(admin._id);
  //   const refreshToken = generateRefreshToken(admin._id);

  const data = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    token: accessToken,
    role: admin.role,
    services: validServices,
  };

  res.json(new ApiResponse(201, data, "New admin created successfully", true));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.matchPassword(password))) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials", false));
  }

  const accessToken = generateAccessToken(admin._id);
  //   const refreshToken = generateRefreshToken(admin._id);
  //   sendRefreshToken(res, refreshToken);

  const data = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    token: accessToken,
  };

  res.json(new ApiResponse(200, data, "Admin login successful", true));
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, services } = req.body;

  const admin = await Admin.findById(id);
  if (!admin) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Admin not found", false));
  }

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (role) admin.role = role;
  if (services?.length) {
    const validServices = await Services.find({ _id: { $in: services } });
    if (validServices.length !== services.length) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Invalid service IDs provided", false)
        );
    }
    admin.services = validServices.map((service) => service._id);
  }

  await admin.save();

  const updatedAdmin = await Admin.findById(id).populate("services");

  res.json(
    new ApiResponse(200, updatedAdmin, "Admin updated successfully", true)
  );
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(id);
  if (!admin) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Admin not found", false));
  }

  await admin.deleteOne();

  res.json(new ApiResponse(200, null, "Admin deleted successfully", true));
});

const getAllSubAdmins = asyncHandler(async (req, res) => {
  const adminId = req.admin._id;

  const subAdmins = await Admin.find({
    role: "sub_admin",
    created_by: adminId,
  })
    .select("-password")
    .populate("services");

  res.json(
    new ApiResponse(200, subAdmins, "Sub Admins fetched successfully", true)
  );
});

const registerSubAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const reqAdmin = req.admin;
  const adminId = reqAdmin.id;

  if (reqAdmin.role !== "admin") {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Only admin can create sub admin", false)
      );
  }

  const admin = await Admin.findOne({ email });

  if (admin) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Sub Admin already exists", false));
  }

  const subAdmin = await Admin.create({
    name,
    email,
    password,
    role: "sub_admin",
    created_by: adminId,
  });

  const accessToken = generateAccessToken(subAdmin._id);

  const data = {
    id: subAdmin.id,
    name: subAdmin.name,
    email: subAdmin.email,
    token: accessToken,
    role: subAdmin.role,
    created_by: subAdmin.created_by,
  };

  res.json(
    new ApiResponse(201, data, "New sub admin created successfully", true)
  );
});

module.exports = {
  getAllAdmins,
  registerAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  getAllSubAdmins,
  registerSubAdmin,
  // logoutAdmin,
};

// const logoutAdmin = (req, res) => {
//   res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
//   res.json(new ApiResponse(200, null, "Logged out successfully", true));
// };
