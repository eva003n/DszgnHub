//standadize success  responses

class ApiResponse {
  status: number;
  data: any;
  message: string;
  success: boolean;
    constructor(statusCode: number, data:any, message = "success") {
      this.status = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400; //false if statusCode > 400
   
    }
  }
  
  export default ApiResponse;
  