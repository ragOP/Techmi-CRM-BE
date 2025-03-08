const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ApiResponse = require("../utils/ApiResponse");

const authenticateRole =
  (allowedRoles, checkSuperAdmin = false) =>
  async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer")) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized", false));
    }

    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res
          .status(403)
          .json(new ApiResponse(403, null, "User not found", false));
      }

      // Check if the user is a super admin when required
      if (checkSuperAdmin && !user.is_super_admin) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Access denied. Super Admin only.",
              false
            )
          );
      }

      // Check role-based access if not checking for super admin
      if (!checkSuperAdmin && !allowedRoles.includes(user.role)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              `Access denied. Only ${allowedRoles.join(" or ")} allowed.`,
              false
            )
          );
      }

      req.user = user;
      next();
    } catch (error) {
      res
        .status(403)
        .json(new ApiResponse(403, null, "Invalid or expired token", false));
    }
  };

// Role-based authentication middlewares
const admin = authenticateRole(["admin"]);
const user = authenticateRole(["user"]);
const superAdmin = authenticateRole([], true); // Super Admin check based on is_super_admin

module.exports = {
  admin,
  user,
  superAdmin,
};
