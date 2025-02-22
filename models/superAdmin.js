const SuperAdminSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const SuperAdmin = mongoose.model("SuperAdmin", SuperAdminSchema);
