import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import type { Request, Response } from "express"

const healthCheck = asyncHandler(async (req:Request, res:Response) => {
    return res.status(200)
    .json(new ApiResponse(200, "Ok", "Health check passed"))
 
})

export {
    healthCheck
}