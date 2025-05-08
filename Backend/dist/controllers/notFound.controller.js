import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
const notFound = asyncHandler(async (req, res, next) => {
    return next(ApiError.notFound(404, "Not Found"));
});
export default notFound;
