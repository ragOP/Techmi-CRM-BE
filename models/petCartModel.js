const mongoose = require("mongoose");

const PetCaartResponseSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
});

module.exports = mongoose.model("PetCartResponse", PetCaartResponseSchema);
