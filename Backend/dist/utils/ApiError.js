//standadize error response
class ApiError extends Error {
    status;
    success;
    message;
    error;
    constructor(statusCode, error, message = "Something went wrong", stack = "") {
        super(message);
        this.status = statusCode;
        this.message = message;
        this.success = false;
        this.error = error;
        if (stack) {
            this.stack = stack;
        }
        else {
            //captures the stack trace vand sets it to the ApiError stack property
            Error.captureStackTrace(this, this.constructor);
        }
    }
    // static method to create a new instance of ApiError
    static badRequest(statusCode, message) {
        return new ApiError(statusCode, message);
    }
    static unAuthorizedRequest(statusCode, message) {
        return new ApiError(statusCode, message);
    }
    static conflictRequest(statusCode, message) {
        return new ApiError(statusCode, message);
    }
    static notFound(statusCode, message) {
        return new ApiError(statusCode, message);
    }
    static unprocessable(statusCode, message) {
        return new ApiError(statusCode, message);
    }
    static tooManyRequest(statusCode, message) {
        return new ApiError(statusCode, message);
    }
    static forbiddenRequest(statusCode, message) {
        return new ApiError(statusCode, message);
    }
    static internalServerError(statusCode, message) {
        return new ApiError(statusCode, message);
    }
}
export default ApiError;
