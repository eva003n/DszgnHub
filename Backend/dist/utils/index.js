import { generateKey } from "crypto";
import mongoose from "mongoose";
//format the default joi error
function formatError(error) {
    return error
        .toString()
        .split("")
        .filter((char) => char !== '"')
        .join("");
}
const convertToObjectId = (id) => {
    // return mongoose.Types.ObjectId.createFromHexString(id);
    return new mongoose.Types.ObjectId(id);
};
const sendVerificationCode = (func, userEmail) => {
    generateKey("hmac", { length: 30 }, async (err, key) => {
        console.log(key.export().toString("hex"));
        const code = key.export().toString("hex").toUpperCase();
        func(code, userEmail);
    });
    return true;
};
export { formatError, convertToObjectId };
;
