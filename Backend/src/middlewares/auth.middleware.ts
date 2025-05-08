import type { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Jwt, { type JwtPayload } from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/Recipe-sharing-app/user.model.js";
import type { ProtectedRequest } from "../interfaces/Recipe-sharing-app/request.interface.js";
import type { UserInterface } from "../interfaces/Recipe-sharing-app/model.interface.js";
const protectRoute = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;
    //extract accesstoken from cookies
    if (!accessToken)
      return next(ApiError.badRequest(400, "Access token is required"));
    //decode accesstoken with token secret to check validity

    const decodedToken = Jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;

    //query db with user credentials
    const user:UserInterface | null = await User.findById(decodedToken._id);
    if (!user)
      return next(
        ApiError.unAuthorizedRequest(
          401,
          "Unauthorized request, user doesn't exist or is already deleted"
        )
      );

    // attach the user to request obj
    req.user = user;
    next();
  }
);

export { protectRoute };
