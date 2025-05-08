/*Handling mutipart-form-data */
import asyncHandler from "../utils/asyncHandler.js";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";

const options = {
  limits: {
    fileSize: 5 * 1024 * 1024, //5MB
    files: 5 //max no of file fileds
  },
  //traverses the each and every uploaded file if many and evaluates the mimetype
  fileFilter: (req:Request, file:any, cb:any) => {
    if(!file.originalname.match((/\.(jpg|jpeg|png|avif)$/))) {
      //reject file
      cb(new Error("File mimetype not supported, allowed [jpeg,jpg,png,avif]"), false)

    }
    //accept file
    cb(null, true);

  }
};
const upload = multer(options);

//upload a single file
const uploadSingleFile = (name:string) => upload.single(name);
//upload multiple files with the same name
const uploadMultipleFiles = (name:string, numberOfFiles:number ) => upload.array(name, numberOfFiles);
//upload multiple files with different names,array of objects where the key is the name of  file ana value is array of files
const uploadMultipleFields = (fields=[]) => upload.fields(fields);
//handle text-only
const uploadTextOnly = () => upload.none();
//accept all files 
const uploadAnyFiles = () => upload.any();

asyncHandler(async(req:Request, res:Response, next:NextFunction) => upload)

export {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadMultipleFields,
  uploadTextOnly,
  uploadAnyFiles
}
