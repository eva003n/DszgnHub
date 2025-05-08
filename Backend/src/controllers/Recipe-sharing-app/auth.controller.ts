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
} from "../../middlewares/validators/Recipe-sharing-app/index.js";
import type { ProtectedRequest } from "../../interfaces/Recipe-sharing-app/request.interface.js";
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, EMAIL_ADDRESS, NODE_ENV, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from "../../config/env.js"; 
import resend from "../../mail/index.js";
import { APP_NAME } from "../../constants.js";

const signUp = asyncHandler(async (req: ProtectedRequest, res: Response, next:NextFunction) => {
  const { userName, email, password, confirmPassword } = req.body as signUpAuth;
  // console.log(req.body)

  // check if user exist before creating new user
  const isExistingUser = await User.findOne({
    $or: [{ userName: userName }, { email: email }],
  });

  //if user exist throw error
  if (isExistingUser) {
    return res
      .status(409)
      .json(ApiError.conflictRequest(409, "User already exist, please login"));
  }
  //if user does not exist
  const newUser = await User.create({
    userName,
    email,
    password,
  });

  //generate randon OTP
  /*generateKey("hmac", { length: 30 }, async (err, key) => {
        console.log(key.export().toString("hex"));
        const code = key.export().toString("hex").toUpperCase();
        sendMail(code, email);
      });*/
  //hide password and refresh token after making them visible in query so that it doesnt appear in response
  newUser.password = undefined;

  //aend email
  // const { data, error } = await sendEmail(newUser.email, "Account creation", `Hello ${newUser.userName}, your account has been created successfully 🎉🎉`);
  // if (error) 
  //   return next(ApiError.internalServerError(500, error, error.message));
  

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "Account created successfully"));
});

//Authentication
const logIn = asyncHandler(async (req: Request, res: Response) => {
  //user credentials, validate them before generating a token
  const { email, password } = req.body as logInAuth;

  //returns a doc that matches email and includes password field in query
  const isExistingUser = await User.findOne({ email: email }).select(
    "+refreshToken +email"
  );
  if (!isExistingUser) {
    return res.status(404).json(ApiError.notFound(404, "User doesn't exist, create an account"));
  }
  //this wont work if passowrd is hidden
  const isValidPassword = await isExistingUser.isMatchingPassword(password);

  if (!isValidPassword) {
    return res
      .status(401)
      .json(ApiError.unAuthorizedRequest(401, "Invalid username or password"));
  }
  //generate token for user session
  const { accessToken, refreshToken } = generateToken(
    isExistingUser._id,
    isExistingUser.email
  );

  isExistingUser.refreshToken = refreshToken;
  await isExistingUser.save();
  //hide password and refresh token after making them visible in query so that it doesnt appear in response
  isExistingUser.password = undefined;
  isExistingUser.refreshToken = undefined;

  //configure and send cookie
  configureAndSendCookie(res, accessToken, refreshToken);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: isExistingUser, accessToken },
        "Logged in successfully"
      )
    );
});

const logOut = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //check refresh token in cookie
    const refreshToken = req.cookies.RefreshToken;
    //if it does not exist
    if (!refreshToken)
      return next(ApiError.badRequest(400, "No refresh token provided"));

    //check if the refresh token sent by the client matches  secret
    //to ensure the compiler doesnt throw error when trying to access a property after decoding the token we ensure the func returns an object of type JwtPayload
    const decodeToken = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;
    if (!decodeToken)
      return next(ApiError.badRequest(400, "Invalid refresh token"));
    //delete refresh token from database
    const user = await User.findById(decodeToken.userId);
    if (!user) return next(ApiError.notFound (404, "User doesn't not exist"));
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
      return next(ApiError.badRequest(400, "No refresh token provided"));
    }
    //verify refresh token
    const decodeToken = jwt.verify(
      RefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decodeToken.userId).select("+refreshToken +email");
    if (!user) return next(ApiError.notFound(404, "User doesn't not exist"));
    if (user.refreshToken !== RefreshToken) {
      return next(ApiError.unAuthorizedRequest(401, "Invalid refresh token"));
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

    return res.status(201).json(
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
  res.cookie("AccessToken", accessToken, {
    httpOnly: true, //prevent xss attacks
    maxAge: 15 * 60 * 1000, //15min
    secure: NODE_ENV === "production",
    sameSite: "strict", //CSRF cross site resource forgery attack
  })
  .cookie("RefreshToken", refreshToken, {
    httpOnly: true, //prevent xss attacks
    secure: NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, //1day
  });
};

const generateToken = (userId: string, userEmail: string, OTP?: string) => {
  const accessToken = jwt.sign(
    //header -> signing algorithm and token type
    //payload
    {
      userId,
      userEmail,
      OTP,
    },
    //signing secret
    ACCESS_TOKEN_SECRET as string,
    //sign options
    {
      expiresIn: ACCESS_TOKEN_EXPIRY || "15m",
      issuer: APP_NAME,
      subject: "Authentication",
    }
  ) ;

  const refreshToken = jwt.sign(
    { userId },
    REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY || "1d",
      issuer: APP_NAME,
      subject: "Authentication",
    }
  );

  return { accessToken, refreshToken };
};
/**
 * controllers receive request from routers, validate the request, call services and return a response
 */

const sendEmail = async (receiver: string, subject: string, text: string) => {
  const {data, error} = await resend.emails.send({
    from: EMAIL_ADDRESS as string,
    to: receiver,
    subject: subject,
    html: `<p style="font-size: 16px">${text}</p>`
  })
   return {data, error}

}
export { signUp, logIn, logOut, tokenRefresh };
// console.log(EMAIL_ADDRESS)