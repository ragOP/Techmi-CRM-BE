const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    is_super_admin: {
      type: Boolean,
      default: false,
      validate: {
        validator: function (value) {
          // is_super_admin can only be true if role is "admin"
          return this.role === "admin" || value === false;
        },
        message: "is_super_admin can only be true for admin users",
      },
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
