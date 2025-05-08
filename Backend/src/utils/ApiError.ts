import  type {  ZodIssue } from "zod";
//standadize error response
class ApiError extends Error {
  status: number;
  success: boolean;
  override message: string;
  error:string | ZodIssue[];
    constructor(
      statusCode:number,
      error:string | ZodIssue[],
      message: string = "Something went wrong",
      stack = ""
    ) {
      super(message);
      this.status = statusCode || 500;
      this.message = message;
      this.success = false;
      this.error = error;
  
      if (stack) {
        this.stack = stack;
      } else {
        //captures the stack trace vand sets it to the ApiError stack property
        Error.captureStackTrace(this, this.constructor);
      }
    }
    // static method to create a new instance of ApiError
  
    static badRequest(statusCode: number, error: string | ZodIssue[], message: string = "Bad Request") {
      return new ApiError(statusCode, error, message);
    }
  
  
    static unAuthorizedRequest(statusCode: number, error: string , message: string = "Unauthorized request") {
      return new ApiError(statusCode, error, message);
    }
    static conflictRequest(statusCode: number, error: string | ZodIssue[]) {
      return new ApiError(statusCode, error);
    }
    static notFound(statusCode:number, error: string | ZodIssue[]) {
      return new ApiError(statusCode, error);
    }
  
    static unprocessable(statusCode:number, error: string | ZodIssue[]) { 
      return new ApiError(statusCode, error);
    }
    static tooManyRequest(statusCode:number, error: string | ZodIssue[]) {
      return new ApiError(statusCode, error);
    }
    static forbiddenRequest(statusCode:number, error: string | ZodIssue[]) {
      return new ApiError(statusCode, error)
    }
    static internalServerError(statusCode:number,error: any, message: string) {
      return new ApiError(statusCode, error, message)
  
    }
  }
  
  export default ApiError;
  