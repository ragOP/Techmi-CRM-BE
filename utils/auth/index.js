const jwt = require("jsonwebtoken");

// Generate access token (short-lived)
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Generate refresh token (long-lived)
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
