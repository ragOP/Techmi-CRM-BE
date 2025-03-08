const { asyncHandler } = require("../common/asyncHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ApiResponse = require("../utils/ApiResponse");
const { generateAccessToken, generateRefreshToken } = require("../utils/auth");
const Services = require("../models/servicesModel");

// Set refresh token as HTTP-only cookie
const sendRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(new ApiResponse(200, users, "Users fetched successfully", true));
});

// Get All admins
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    role: "admin",
    is_super_admin: { $ne: true },
  })
    .select("-password")
    .populate("services");

  res.json(new ApiResponse(200, admins, "Admins fetched successfully", true));
});

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, is_super_admin, services } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res
      .status(200)
      .json(new ApiResponse(404, null, "User already exists", false));
  }

  let validServices = [];
  if (services && services.length > 0) {
    validServices = await Services.find({ _id: { $in: services } });
    if (validServices.length !== services.length) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Invalid service IDs provided", false)
        );
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    is_super_admin,
    services: validServices.map((service) => service._id),
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  sendRefreshToken(res, refreshToken);

  const data = {
    id: user.id,
    name: user.name,
    email: user.email,
    token: accessToken,
    role: user.role,
    is_super_admin: user.is_super_admin || false,
    services: validServices,
  };

  res.json(new ApiResponse(200, data, "New user created successfully", true));
});

// Generic Login Function
const loginUser = asyncHandler(
  async (req, res, allowedRoles, isSuperAdminCheck, errorMessage) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(200)
        .json(new ApiResponse(404, null, "Invalid credentials", false));
    }

    if (
      !allowedRoles.includes(user.role) ||
      (isSuperAdminCheck && !user.is_super_admin)
    ) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, errorMessage, false));
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    sendRefreshToken(res, refreshToken);

    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_super_admin: user.is_super_admin || false,
      token: accessToken,
    };

    res.json(new ApiResponse(200, data, `${user.role} login successful`, true));
  }
);

// User Login
const userLogin = asyncHandler(async (req, res) => {
  await loginUser(req, res, ["user"], false, "Access denied. User login only.");
});

// Admin Login
const adminLogin = asyncHandler(async (req, res) => {
  await loginUser(
    req,
    res,
    ["admin"],
    false,
    "Access denied. Admin login only."
  );
});

// Super Admin Login
const superAdminLogin = asyncHandler(async (req, res) => {
  await loginUser(
    req,
    res,
    ["admin"],
    true,
    "Access denied. Super Admin login only."
  );
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, is_super_admin, services } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found", false));
  }

  let validServices = [];
  if (services && services.length > 0) {
    validServices = await Services.find({ _id: { $in: services } });

    if (validServices.length !== services.length) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Invalid service IDs provided", false)
        );
    }
    user.services = validServices.map((service) => service._id);
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  if (typeof is_super_admin !== "undefined")
    user.is_super_admin = is_super_admin;

  console.log(user, ">>>>>>>>> USER")
  await user.save();

  const updatedUser = await User.findById(id).populate("services");

  res.json(
    new ApiResponse(200, updatedUser, "User updated successfully", true)
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found", false));
  }

  await user.deleteOne(); // Deletes the user
  res.json(new ApiResponse(200, null, "User deleted successfully", true));
});

// Refresh Token Endpoint
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: "User not found" });

      const newAccessToken = generateAccessToken(user._id);
      res.json({ token: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout User (Clear refresh token)
const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ message: "Logged out" });
};

module.exports = {
  getAllUsers,
  getAllAdmins,
  registerUser,
  userLogin,
  adminLogin,
  superAdminLogin,
  refreshToken,
  logoutUser,
  updateUser,
  deleteUser,
};
