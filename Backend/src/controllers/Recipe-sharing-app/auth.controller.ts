import User from "../../models/Recipe-sharing-app/user.model.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { formatError } from "../../utils/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import type {
  logInAuth,
  signUpAuth,
  verificationCode,
} from "../../middlewares/validators/Recipe-sharing-app/index.js";
import type { ProtectedRequest } from "../../interfaces/Recipe-sharing-app/request.interface.js";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  API_DOC_URI,
  EMAIL_ADDRESS,
  FRONTEND_URL,
  NODE_ENV,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  VERIFICATIOB_URI,
  VERIFICATION_TOKEN_EXPIRY,
  VERIFICATION_TOKEN_SECRET,
} from "../../config/env.js";
import resend from "../../mail/index.js";
import { APP_NAME } from "../../constants.js";
import { randomInt } from "node:crypto";
import * as speakeasy from "speakeasy";
import { toDataURL } from "qrcode";
import type { ObjectId } from "mongoose";
import type { UserInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";

import { generateEmailTemplate } from "../../mail/template.js";

const signUp = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { userName, email, password } = req.body as signUpAuth;
    // console.log(req.body)

    const session = await User.startSession()
    session.startTransaction()


    // check if user exist before creating new user
    const isExistingUser = await User.findOne({
      $or: [{ userName: userName }, { email: email }],
    }).session(session);

    //if user exist throw error
    if (isExistingUser) {
      return res
        .status(400)
        .json(
          ApiError.badRequest(
            400,
            `${req.originalUrl}`,
            "Account already exist, please login"
          )
        );
    }
    // const secret = randomInt(999999);
    //generate a TOTP based 
    const secret = speakeasy.generateSecret()
    const code = secret.base32
    //if user does not exist
    const newUser = await User.create(
      [
        {
          userName,
          email,
          password,
          verificationSecret: code ,
        },
      ],
      { session }
    );
if(newUser[0]){
  newUser[0].password = undefined
  newUser[0].verificationSecret = undefined;
}
  
const token = speakeasy.totp({
  secret: code,
  encoding: "base32",
  step: 300, //5 min
})
console.log(token)
    const { data, error } = await sendEmail(
      email,
      "DezgnHubAPI",
      "Verific]ation code",
      token
    );
    if (error){
      return next(
        ApiError.internalServerError(500, `${req.originalUrl}`, error.message)
      );
    }
      await session.commitTransaction()
      await session.endSession()

      //create user using clerk
      // await clerkClient.users.createUser({username: userName, emailAddress: [email], password})
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          newUser[0],
          "Account created successfully, check verification code sent to email"
        )
      );
  }
);

//verify account creation
const verifyEmail = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { verification_code, user_id } = req.body as verificationCode;
    // const { VerificationToken } = req.cookies;

    //verify verification code
    const user = await User.findById(user_id).select("+verificationSecret")
    if (!user)
      return next(
        ApiError.notFound(
          404,
          `${req.originalUrl}`,
          "Account doesn't exist, please create an account"
        )
      );
      if(!user.verificationSecret) throw new Error("Missing verification secret")
        console.log(verification_code)
    const verified = speakeasy.totp.verify({
      secret: user.verificationSecret,
      encoding: "base32",
      token: verification_code,
      step: 300 ,
      window: 1 //allow slight time drift

    })


    if (!verified)
      return next(
        ApiError.badRequest(400, `${req.originalUrl}`, "Invalid verification code provided")
      );

//set email verification as completed
    user.setIsVerified(true);
    await user.save();
    user.verificationSecret = undefined

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Email verified successfully"));
  }
);
//Authentication
const logIn = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    //user credentials, validate them before generating a token
    const { email, password } = req.body as logInAuth;

    //returns a doc that matches email and includes password field in query
    const isExistingUser = await User.findOne({ email: email }).select(
      "+email +password + verificationSecret"
    );

    // isExistingUser && isExistingUser.maxRetry++;
    // isExistingUser && await isExistingUser.save();

    if (!isExistingUser) {
      return next(
        ApiError.notFound(
          404,
          `${req.originalUrl}`,
          "Account doesn't exist, create an account"
        )
      );
    }
    //this wont work if passowrd is hidden
    const isValidPassword = await isExistingUser.isMatchingPassword(password);

    if (!isValidPassword) {
      return next(
        ApiError.unAuthorizedRequest(
          401,
          `${req.originalUrl}`,
          "Invalid username or password"
        )
      );
    }

    //send twoFA qr code
    const secret = speakeasy.generateSecret();
    const code = secret.base32

    isExistingUser.verificationSecret = code;
    await isExistingUser.save();

    isExistingUser.password = undefined;
    isExistingUser.verificationSecret = undefined;

     const dataUrl = await toDataURL(secret.otpauth_url as string);
    return res
      .status(200)
      .setHeader("Content-Type", "text/html")
      .send(
        `<p style="text-align: center;">Scan the QR code for two-factor authentication</p>
        <div style=" display: flex; justify-content: center;">
        <img src="${dataUrl}" alt="qr-code for two-factor authentication" />
        </div>
        `
      );
  }
);
//Multifactor authentication using two-factor-auth
const verifyMFA = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { verification_code: token, user_id } = req.body as verificationCode;
    const user = await User.findById(user_id).select(
      "+verificationSecret +refreshToken +email"
    );
    if (!user)
      return next(
        ApiError.notFound(400, req.originalUrl, "User does not exist")
      );
if(!user.verificationSecret) throw new Error("Missing verification secret")
    const isVerified = speakeasy.totp.verify({
      secret: user.verificationSecret,
      encoding: "base32",
      token,
    });
    if (!isVerified)
      return next(
        ApiError.badRequest(
          400,
          req.originalUrl,
          "Invalid Time-based OTP provided"
        )
      );

    //generate token for user session
    const { accessToken, refreshToken } = generateToken(user._id, user.email);

    //set user as verified not email
    user.setIsVerified(false);
    user.refreshToken = refreshToken;
    await user.save();

    //hide refresh token after making them visible in query so that it doesnt appear in response
    user.refreshToken = undefined;
    user.verificationSecret = undefined;

    //configure and send cookie
    configureAndSendCookie(res, accessToken, refreshToken);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: user, accessToken },
          "Logged in successfully"
        )
      );
  }
);

const logOut = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    //check refresh token in cookie
    const { RefreshToken: refreshToken } = req.cookies;
    //if it does not exist
    if (!refreshToken)
      return next(
        ApiError.badRequest(
          400,
          `${req.originalUrl}`,
          "No refresh token provided"
        )
      );

    //check if the refresh token sent by the client matches  secret
    //to ensure the compiler doesnt throw error when trying to access a property after decoding the token we ensure the func returns an object of type JwtPayload
    const decodeToken = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;
    if (!decodeToken)
      return next(
        ApiError.badRequest(400, `${req.originalUrl}`, "Invalid refresh token")
      );
    //delete refresh token from database
    const user = await User.findById(decodeToken.userId);
    if (!user)
      return next(
        ApiError.notFound(
          404,
          `${req.originalUrl}`,
          "Account doesn't not exist"
        )
      );
    user.refreshToken = "";
    await user.save();

    return (
      res
        .status(200)
        .clearCookie("AccessToken")
        .clearCookie("RefreshToken")
        //no content for delete and put request
        .json(new ApiResponse(200, {}, "Logged out successfully"))
    );
  }
);

//refresh access token
const tokenRefresh = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { RefreshToken } = req.cookies;

    if (!RefreshToken) {
      return next(
        ApiError.badRequest(
          400,
          `${req.originalUrl}`,
          "No refresh token provided"
        )
      );
    }
    //verify refresh token
    const decodeToken = jwt.verify(
      RefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decodeToken.userId).select(
      "+refreshToken +email"
    );
    if (!user)
      return next(
        ApiError.notFound(404, `${req.originalUrl}`, "User doesn't not exist")
      );
    if (user.refreshToken !== RefreshToken) {
      return next(
        ApiError.unAuthorizedRequest(
          401,
          `${req.originalUrl}`,
          "Invalid refresh token provided"
        )
      );
    }

    //generate new access & refresh token
    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      user._id,
      user.email
    );
    //update user refresh token
    user.refreshToken = newRefreshToken;
    await user.save();
    //configure and send cookie
    configureAndSendCookie(res, accessToken, newRefreshToken);

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { accessToken },
          "Access token refreshed successfully"
        )
      );
  }
);

const configureAndSendCookie = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res
    .cookie("AccessToken", accessToken, {
      httpOnly: true, //prevent xss attacks
      maxAge: 15 * 60 * 1000, //15min
      secure: NODE_ENV === "production",
      sameSite: "strict",
    })
    .cookie("RefreshToken", refreshToken, {
      httpOnly: true, //prevent xss attacks
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, //1day
    });
};

const generateToken = (
  userId: string,
  userEmail: string,
  code?: number | string
) => {
  const accessToken = jwt.sign(
    //header -> signing algorithm and token type
    //payload
    {
      userId,
      userEmail,
      code,
    },
    //signing secret
    ACCESS_TOKEN_SECRET as string,
    //sign options
    {
      expiresIn: ACCESS_TOKEN_EXPIRY || "15m",
      issuer: APP_NAME,
      subject: "Authentication",
    }
  );

  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET as string, {
    expiresIn: REFRESH_TOKEN_EXPIRY || "1d",
    issuer: APP_NAME,
    subject: "Authentication",
  });

  const verificationToken = jwt.sign(
    //header
    //payload
    {
      userId,
      userEmail,
      code,
    },
    //secret
    VERIFICATION_TOKEN_SECRET as string,
    //sign options
    {
      expiresIn: VERIFICATION_TOKEN_EXPIRY || ("15m" as string),
      issuer: APP_NAME,
      subject: "Verification",
    }
  );

  return { accessToken, refreshToken, verificationToken };
};
/**
 * controllers receive request from routers, validate the request, call services and return a response
 */

const sendEmail = async (
  receiver: string,
  appName: string,
  title: string,
  code: string | number
) => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: receiver,
    subject: title,
    html: generateEmailTemplate(appName, title, code),
  });
  return { data, error };
};

export { signUp, logIn, logOut, tokenRefresh, verifyEmail, verifyMFA };
