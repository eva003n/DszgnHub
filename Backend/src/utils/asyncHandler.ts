import type { Request, Response, NextFunction } from "express";
import type { ProtectedRequest } from "../interfaces/Recipe-sharing-app/request.interface.js";
//ffunction type expression
type requestFunc = (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;
const asyncHandler = (requestHandler: requestFunc) => {
  return (req: ProtectedRequest , res: Response, next: NextFunction) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
