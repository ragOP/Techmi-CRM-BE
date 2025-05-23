const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { asyncHandler } = require("../../../common/asyncHandler");
const { convertToCSV } = require("../../../helpers/products/convertToCSV");
const { convertToXLSX } = require("../../../helpers/products/convertToXSLV");
const User = require("../../../models/userModel");
const ApiResponse = require("../../../utils/ApiResponse");
const { generateAccessToken } = require("../../../utils/auth");
const { uploadPDF } = require("../../../utils/upload");
const { sendEmail } = require("../../../helpers/email");

const getAllUsers = asyncHandler(async (req, res) => {
  const superAdminId = req.admin._id;

  if (!superAdminId) {
    return res.json(new ApiResponse(404, null, "Not authorized"));
  }

  const { search, page, per_page = 50, start_date, end_date } = req.query;

  const filters = {
    ...(search && {
      name: { $regex: search, $options: "i" },
      email: { $regex: search, $options: "i" },
    }),
    ...(start_date || end_date
      ? {
          createdAt: {
            ...(start_date && { $gte: new Date(start_date) }),
            ...(end_date && { $lte: new Date(end_date) }),
          },
        }
      : {}),
  };

  const skip = (page - 1) * per_page;

  const [users, total] = await Promise.all([
    User.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(per_page))
      .select("-password"),
    User.countDocuments(filters),
  ]);

  const data = {
    data: users,
    total: total,
  };

  res.json(new ApiResponse(200, data, "Users fetched successfully", true));
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User already exists", false));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const accessToken = generateAccessToken(user._id);

  const data = {
    id: user.id,
    name: user.name,
    email: user.email,
    token: accessToken,
    role: role ? role : "user",
  };

  res.json(new ApiResponse(201, data, "New user created successfully", true));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials", false));
  }

  if (user.is_active === false) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Admin is not active", false));
  }

  const accessToken = generateAccessToken(user._id);

  const data = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: accessToken,
  };

  res.json(new ApiResponse(200, data, "User login successful", true));
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, is_active } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found", false));
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (is_active) user.is_active = role;

  await user.save();
  const updatedUser = await User.findById(id);

  res.json(
    new ApiResponse(200, updatedUser, "User updated successfully", true)
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found", false));
  }

  await user.deleteOne();

  res.json(new ApiResponse(200, null, "User deleted successfully", true));
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");
  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found", false));
  }

  res.json(new ApiResponse(200, user, "User fetched successfully", true));
});

const getUsersByRole = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { role } = req.query;

  if (!userId) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found", false));
  }

  const validRoles = ["salesperson", "dnd", "user"];
  if (!validRoles.includes(role)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid role specified", false));
  }

  const users = await User.find({ role }).select("-password");

  res.json(
    new ApiResponse(
      200,
      users,
      `${role.charAt(0).toUpperCase() + role.slice(1)} fetched successfully`,
      true
    )
  );
});

const exportUsers = asyncHandler(async (req, res) => {
  const fileType = req.query.fileType?.toLowerCase() || "xlsx";
  const startDate = req.query.start_date
    ? new Date(req.query.start_date)
    : null;
  const endDate = req.query.end_date ? new Date(req.query.end_date) : null;
  const filter = {};
  if (startDate && endDate) {
    filter.createdAt = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    filter.createdAt = { $gte: startDate };
  } else if (endDate) {
    filter.createdAt = { $lte: endDate };
  }

  const users = await User.find(filter).lean().select("-password");
  const serializedUsers = users.map((p) => {
    const { __v, _id, createdAt, updatedAt, ...rest } = p;
    return {
      id: _id.toString(),
      createdAt: createdAt?.toISOString(),
      updatedAt: updatedAt?.toISOString(),
      ...rest,
    };
  });

  let buffer;
  let mimeType = "";
  let filename = `users_${Date.now()}.${fileType}`;

  if (fileType === "csv") {
    const content = convertToCSV(serializedUsers);
    buffer = Buffer.from(content, "utf-8");
    mimeType = "text/csv";
  } else if (fileType === "xlsx") {
    buffer = convertToXLSX(serializedUsers);
    mimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Unsupported file type", false));
  }

  // Write buffer to a temp file
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, filename);
  await fs.writeFile(tempFilePath, buffer);

  // Upload to Cloudinary
  const url = await uploadPDF(tempFilePath, "exports");

  console.log("Cloudinary File URL:", url);

  // Respond with the Cloudinary URL
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { url, mimeType, filename },
        "Products exported and uploaded successfully",
        true
      )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found", false));
  }

  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${token}?email=${user.email}`;

    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password",
      html: `
        <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 30px; border-radius: 8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
            <tr>
              <td align="left" style="padding-bottom: 20px;">
                <h2 style="color: #333333; margin: 0;">Hello ${user.name},</h2>
              </td>
            </tr>
            <tr>
              <td align="left" style="color: #555555; font-size: 16px; line-height: 1.6;">
                <p>We received a request to reset your password. You can reset it by clicking the button below:</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px 0;">
                <a href="${resetPasswordUrl}" style="background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; display: inline-block;">Reset Password</a>
              </td>
            </tr>
            <tr>
              <td align="left" style="color: #555555; font-size: 16px; line-height: 1.6;">
                <p>If you didn't request a password reset, please disregard this email. Your account is safe.</p>
                <p>If you have any questions, feel free to contact our support team.</p>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding-top: 30px; color: #555555; font-size: 16px;">
                <p>Best regards,</p>
                <p><strong>The ${process.env.APP_NAME} Team</strong></p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 40px; font-size: 12px; color: #999999;">
                <p>&copy; ${new Date().getFullYear()} ${
        process.env.APP_NAME
      }. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

      `,
    };

    await sendEmail(emailOptions);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Password reset email sent successfully",
          true
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          `Failed to send password reset email: ${error.message}`,
          false
        )
      );
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "User not found", false));
    }

    user.password = password;
    await user.save();

    res.json(new ApiResponse(200, null, "Password reset successfully", true));
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            null,
            "Password reset link has expired. Please request a new one.",
            false
          )
        );
    }
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid or malformed token", false));
  }
});

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getUserById,
  getUsersByRole,
  exportUsers,
  forgotPassword,
  resetPassword,
};
