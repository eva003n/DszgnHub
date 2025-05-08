import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import ApiError from "../utils/ApiError.js";
import { formatError } from "../utils/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import type { ProtectedRequest } from "../interfaces/Recipe-sharing-app/request.interface.js";

const validate =
  <T>(schema: ZodSchema<T>) =>
asyncHandler(async(req: ProtectedRequest, res: Response, next: NextFunction) => {
  const { error } = schema.safeParse(req.body);
// console.table(error?.errors);
  if (error) return next(ApiError.badRequest(400, error.errors));
  next();
})

  export {
    validate
  }