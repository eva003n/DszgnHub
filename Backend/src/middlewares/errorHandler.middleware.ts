import type { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError.js";

const errorHandlerMiddleware = async (err:any, req:Request, res:Response, next:NextFunction) => {
    // console.log(err);
return res.status(err.status || 500).json(err);
}
export default errorHandlerMiddleware;