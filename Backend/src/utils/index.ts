 import {generateKey, createHmac} from "crypto"
import mongoose from "mongoose";
//format the default joi error
const formatError = (error: any[]) => {
  return `${error[0].message} at field${error[0].path}`;

}
const convertToObjectId = (id:string) => {
    // return mongoose.Types.ObjectId.createFromHexString(id);
    return new mongoose.Types.ObjectId(id);
}

const sendVerificationCode = (func:any, userEmail:  string) => {
  generateKey("hmac", {length: 30}, async (err, key) => {

      console.log(key.export().toString("hex"));
      const code = key.export().toString("hex").toUpperCase();
      func(code, userEmail);
    
  })
  return true;

}

export { formatError, convertToObjectId }; ;
