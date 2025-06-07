const { asyncHandler } = require("../../common/asyncHandler");
const PetCart = require("../../models/petCartModel");
const ApiResponse = require("../../utils/ApiResponse");

const getPetCartResponse = asyncHandler(async (req, res) => {
    const petCartResponse = await PetCart.find();
    return res.json(
        new ApiResponse(200, petCartResponse, "Records fetched successfully", true)
    );
});

const createPetCartResponse = asyncHandler(async (req, res) => {
    const { name, email, mobile } = req.body;

    // check for existing user
    const existingUser = await PetCart.findOne({ email });

    if (existingUser) {
        return res
            // .status(400)
            .json(new ApiResponse(400, null, "User already exists", false));
    }

    const petCartResponse = await PetCart.create(req.body);
    return res.json(
        new ApiResponse(200, petCartResponse, "Record created successfully", true)
    );
});

module.exports = {
    getPetCartResponse,
    createPetCartResponse
}