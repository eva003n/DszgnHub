
import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../../utils/asyncHandler.js";

const createProfile = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {

})
const updateProfile = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
  
  
})

 const getProfileDetails = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
  
 })

//heleper functionn to get user by id
const getUser = asyncHandler(async(req:Request, res:Response, next:NextFunction) => {
})
export { getUser,createProfile, updateProfile, getProfileDetails };
