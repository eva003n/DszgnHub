import type { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.ts";
import ApiResponse from "../utils/ApiResponse.ts";

const healthCheck = asyncHandler(async (req:Request, res:Response) => {
    return res.status(200)
        .json(new ApiResponse(200, "Ok", "Health check passed"));
});
export { healthCheck };
