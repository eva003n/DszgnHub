import User from "../../models/Recipe-sharing-app/user.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { formatError } from "../../utils/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
const signUp = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;
    //validation
    const error = "";
    if (error) {
        return res
            .status(400)
            .json(new ApiError(400, formatError(error) ||
            "Validation error ensure the data meets requirements"));
    }
    // check if user exist before creating new user
    const isExistingUser = await User.findOne({
        $or: [{ userName }, { email }],
    });
    //if user exist throw error
    if (isExistingUser) {
        return res.status(409).json(new ApiError(409, "User already exist"));
    }
    //if user does not exisst
    if (!isExistingUser) {
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
        if (newUser) {
            return res
                .status(201)
                .json(new ApiResponse(201, "Account created successfully"));
        }
    }
});
//Authentication
const logIn = asyncHandler(async (req, res) => {
    //user credentials, validate them before generating a token
    //Avoid long if statements they lead to hanginging request response cycle
    const { email, password } = req.body;
    //validation
    const error = "";
    // validation error
    if (error) {
        return res
            .status(400)
            .json(new ApiError(400, formatError(error), "Data validation error"));
    }
    //returns a doc that matches email and includes password field in query
    const isExistingUser = await User.findOne({ email }).select("+password");
    if (!isExistingUser) {
        return res
            .status(422)
            .json(new ApiError(422, "Invalid username or password"));
    }
    //this wont work if passowrd is hidden
    const isValidPassword = await isExistingUser.isMatchingPassword(password);
    //hide password after making it visible in query
    isExistingUser.password = undefined;
    if (!isValidPassword) {
        return res
            .status(401)
            .json(new ApiError(401, "Invalid username or password"));
    }
    //generate token for user session
    const { accessToken, refreshToken } = generateToken(isExistingUser._id, isExistingUser.email);
    //configure and send cookie
    configureCookie(res, accessToken, refreshToken);
    return res
        .status(200)
        .json(new ApiResponse(200, { user: isExistingUser, accessToken }, "Logged in successfully"));
});
const logOut = asyncHandler(async (req, res) => {
    //check cookie in request
    const refreshToken = req.cookies.RefreshToken;
    //check if the refresh token sent by the client matches  secret
    if (refreshToken) {
        const decodeToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "");
        // await redis.del(`refresh token:${decodeToken._id}`);
        res.status(200);
        res.clearCookie("AccessToken");
        res.clearCookie("RefreshToken");
        //no content for delete and put request
        res.json(new ApiResponse(200, [], "Logged out successfull"));
    }
});
//refresh access token
const tokenRefresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.RefreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            message: "No refresh token provided",
        });
    }
    const decodeToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "");
    // const redis = await connectToRedis();
    // const storedToken = await redis.get(`refresh token:${decodeToken.userId}`);
    // if (storedToken !== refreshToken) {
    //   return res.status(401).json({
    //     message: "Errur Unauthorized",
    //   });
    // }
    // const accessToken = jwt.sign(
    //   // { userId: decodeToken.userId, email: decodeToken.userEmail },
    //   process.env.ACCESS_TOKEN_SECRET || "",
    //   {
    //     expiresIn: "15m",
    //   }
    // );
    res.cookie("AccessToken", {
        httpOnly: true, //prevent xss attacks
        maxAge: 15 * 60 * 1000, //15min
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //CSRF cross site resource forgery attack
    });
    return res.status(200).json({
        message: "Authorization successfull",
    });
});
const configureCookie = (res, accessToken, refreshToken) => {
    res.cookie("AccessToken", accessToken, {
        httpOnly: true, //prevent xss attacks
        maxAge: 15 * 60 * 1000, //15min
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //CSRF cross site resource forgery attack
    });
    res.cookie("RefreshToken", refreshToken, {
        httpOnly: true, //prevent xss attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, //1day
    });
};
const generateToken = (userId, userEmail, OTP) => {
    const accessToken = jwt.sign({ userId, userEmail, OTP }, process.env.ACCESS_TOKEN_SECRET || "", {
        expiresIn: "15m",
        issuer: "Lesps",
        subject: "Authentication",
    });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET || "", {
        expiresIn: "1d",
        issuer: "Lesps",
        subject: "Authentication",
    });
    return { accessToken, refreshToken };
};
/**
 * controllers receive request from routers, validate the request, call services and return a response
 */
export { signUp, logIn, logOut, tokenRefresh };
