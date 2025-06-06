const { asyncHandler } = require("../../common/asyncHandler");
const PetCart = require("../../models/petCartModel");
const ApiResponse = require("../../utils/ApiResponse");

const getPetCartResponse = asyncHandler(async (req, res) => {
    const petCartResponse = await PetCart.find();
    return res.json(
        new ApiResponse(200, petCartResponse, "PetCartResponse fetched", true)
    );
});

const createPetCartResponse = asyncHandler(async (req, res) => {
    const petCartResponse = await PetCart.create(req.body);
    return res.json(
        new ApiResponse(200, petCartResponse, "PetCartResponse created", true)
    );
});

module.exports = {
    getPetCartResponse,
    createPetCartResponse
}