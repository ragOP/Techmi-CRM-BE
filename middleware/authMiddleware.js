const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ApiResponse = require("../utils/ApiResponse");

const admin = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer")) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized", false));
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  admin,
};
