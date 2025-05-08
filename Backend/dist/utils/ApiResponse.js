//standadize success  responses
class ApiResponse {
    status;
    data;
    message;
    success;
    constructor(statusCode, data, message = "success") {
        this.status = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; //false if statusCode > 400
    }
}
export default ApiResponse;
