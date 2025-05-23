const os = require("os");
const path = require("path");
const fs = require("fs/promises");
const { asyncHandler } = require("../../../common/asyncHandler");
const { convertToCSV } = require("../../../helpers/products/convertToCSV");
const { convertToXLSX } = require("../../../helpers/products/convertToXSLV");
const Admin = require("../../../models/adminModel");
const Services = require("../../../models/servicesModel");
const ApiResponse = require("../../../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  // generateRefreshToken,
} = require("../../../utils/auth");
const { uploadPDF } = require("../../../utils/upload");
const { sendEmail } = require("../../../helpers/email");

const getAllAdmins = asyncHandler(async (req, res) => {
  const {
    search = "",
    page = 1,
    per_page = 50,
    start_date,
    end_date,
  } = req.query;

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

  if (admin.is_active === false) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Admin is not active", false));
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
  const { name, email, role, services, is_active } = req.body;

  const admin = await Admin.findById(id);
  if (!admin) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Admin not found", false));
  }

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (role) admin.role = role;
  if (is_active !== undefined) admin.is_active = is_active;

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

const exportAdmins = asyncHandler(async (req, res) => {
  const fileType = req.query.fileType?.toLowerCase() || "xlsx";
  const startDate = req.query.start_date
    ? new Date(req.query.start_date)
    : null;
  const endDate = req.query.end_date ? new Date(req.query.end_date) : null;

  const filter = {
    role: "admin",
  };
  if (startDate && endDate) {
    filter.createdAt = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    filter.createdAt = { $gte: startDate };
  } else if (endDate) {
    filter.createdAt = { $lte: endDate };
  }

  const admins = await Admin.find(filter).lean().select("-password").populate({
    path: "services",
    select: "name",
  });
  const serializedAdmins = admins.map((p) => {
    const { __v, _id, createdAt, updatedAt, services, ...rest } = p;
    return {
      id: _id.toString(),
      createdAt: createdAt?.toISOString(),
      updatedAt: updatedAt?.toISOString(),
      services: services?.map((s) => s.name).join(", "),
      ...rest,
    };
  });

  let buffer;
  let mimeType = "";
  let filename = `admins_${Date.now()}.${fileType}`;

  if (fileType === "csv") {
    const content = convertToCSV(serializedAdmins);
    buffer = Buffer.from(content, "utf-8");
    mimeType = "text/csv";
  } else if (fileType === "xlsx") {
    buffer = convertToXLSX(serializedAdmins);
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

  const url = await uploadPDF(tempFilePath, "exports");

  console.log("Cloudinary File URL:", url);

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

const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(id)
    .select("-password")
    .populate("services");
  if (!admin) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Admin not found", false));
  }

  res.json(new ApiResponse(200, admin, "Admin fetched successfully", true));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Admin not found", false));
  }

  try {
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${token}?email=${admin.email}`;

    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
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
                <h2 style="color: #333333; margin: 0;">Hello ${admin.name},</h2>
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

    const admin = await Admin.findById(decoded.id);

    if (admin.updatedAt.getTime() > decoded.iat * 1000) {
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

    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found", false));
    }

    admin.password = password;
    await admin.save();

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
  getAllAdmins,
  registerAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  getAllSubAdmins,
  registerSubAdmin,
  exportAdmins,
  getAdminById,
  // logoutAdmin,
  forgotPassword,
  resetPassword,
};

// const logoutAdmin = (req, res) => {
//   res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
//   res.json(new ApiResponse(200, null, "Logged out successfully", true));
// };
