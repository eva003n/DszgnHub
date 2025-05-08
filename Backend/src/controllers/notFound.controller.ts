import type { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const notFound = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
    return next(ApiError.notFound(404, "Not Found"));
});
export default notFound;
