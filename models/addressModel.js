const AddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      maxlength: 50,
      default: "Home",
    },
    address_line1: {
      type: String,
      required: true,
      maxlength: 255,
    },
    address_line2: {
      type: String,
      maxlength: 255,
    },
    city: {
      type: String,
      required: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      maxlength: 100,
    },
    postal_code: {
      type: String,
      required: true,
      maxlength: 20,
    },
    country: {
      type: String,
      required: true,
      maxlength: 100,
    },
    dial_code: {
      type: String,
      required: true,
      maxlength: 5,
    },
    phone: {
      type: String,
      required: true,
      maxlength: 20,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
    address_type: {
      type: String,
      enum: ["shipping", "billing", "both"],
      required: true,
    },
  },
  { timestamps: true }
);
