import { config } from "dotenv";

config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});



export const { PORT , MONGO_URI, NODE_ENV,ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY,REFRESH_TOKEN_EXPIRY, RESEND_API_KEY, EMAIL_ADDRESS  } = process.env ;
