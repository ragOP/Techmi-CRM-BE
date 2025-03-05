const { asyncHandler } = require("../common/asyncHandler");
const User = require("../models/userModel");
const ApiResponse = require("../utils/ApiResponse");
const { generateAccessToken, generateRefreshToken } = require("../utils/auth");

// Set refresh token as HTTP-only cookie
const sendRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(new ApiResponse(200, users, "Users fetched successfully", true));
});

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, is_super_admin } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res
      .status(200)
      .json(new ApiResponse(404, null, "User already exists", false));
  }

  const user = await User.create({ name, email, password, is_super_admin });

  const accessToken = generateAccessToken(user._id);
  sendRefreshToken(res, refreshToken);

  const data = {
    id: user.id,
    name: user.name,
    email: user.email,
    token: accessToken,
  };

  res.json(new ApiResponse(200, data, "New user created successful", true));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(200)
      .json(new ApiResponse(404, null, "Invalid credentials", false));
  }

  const accessToken = generateAccessToken(user._id);
  // const refreshToken = generateRefreshToken(user._id);

  // sendRefreshToken(res, refreshToken);
  const data = {
    id: user.id,
    name: user.name,
    email: user.email,
    token: accessToken,
  };
  console.log(data);
  res.json(new ApiResponse(200, data, "Login successful", true));
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
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
};
