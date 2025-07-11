import User from "../../models/Recipe-sharing-app/user.model.js";
import Follow from "../../models/Recipe-sharing-app/follow.model.js";
import { convertToObjectId, formatError } from "../../utils/index.js";
import { getUser } from "./users.controller.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { requestParam } from "../../middlewares/validators/Recipe-sharing-app/index.js";
import type { ProtectedRequest } from "../../interfaces/Recipe-sharing-app/request.interface.js";
import type { FollowInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import type { IFollows } from "../../interfaces/Recipe-sharing-app/follow.interface.js";
import { sendNotification } from "./notifications.controller.js";

const followUser = asyncHandler(async (req:ProtectedRequest, res:Response, next: NextFunction) => {
  //id of the person being followed
    const { user_id } = req.params ;

 

    //check if user to be followed actually exists
    const isUser = await User.findOne({_id:user_id, }, {userName: 1, followers: 1, following: 1});
    if (!isUser)
      return res
        .status(404)
        .json(ApiError.notFound(404, `${req.originalUrl}`, "User does not exist"));

   // prevent the currently logged in user from following themselves
    //the comaprison only works when they are strings since equality checks on objects compare references rather than value
    if ( user_id && user_id?.toString() === req.user._id.toString()) {
      return res
        .status(422)
        .json(
          ApiError.unprocessable(
            422,
            `${req.originalUrl}`,
            "You cannot follow yourself"
          )
        );
    }

    //if follow already exists delete it to implement unfollow

    const isExistingFollow = await Follow.findOneAndDelete(
      {
        $and: [
          {
            follower: req.user._id, //currently logged in user
          },
          {
            followee: convertToObjectId(user_id!), // following same persion
          },
        ],
      },
      // { __v: 0 }
    );
    
    //if its an existing follow implement unfollow logic by deleting it
    if (isExistingFollow)
      return res.status(201).json(new ApiResponse(409, {}, `Successfully unfollowed ${isUser.userName}`))

    //if its not an existibg follow create follow
    const createFollow = await Follow.create({
      follower: req.user._id,
      followee: user_id
    });
    //update followers and following count
    //calculate the followers and followings and update user profile
    const followingsCalculation = [
      {
        //all docs of the filter docs where currently logged in user is either a follower or is being followed
        $match: {
          $or: [
            {
              follower: req.user._id,
            },
            {
              followee: req.user._id,
            },
          ],
        },
      },
      //group the docs into two followers and following and for each that doc matches the condition add  1 otherwise 0
      {
        $group: {
          _id: null,
          followersCount: {
            $sum: {
              $cond: [
                {
                  $eq: ["$followee", convertToObjectId(user_id as string)],
                },
                1,
                0,
              ],
            },
          },
          followingCount: {
            $sum: {
              $cond: [
                {
                  $eq: ["$follower", req.user._id],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          followersCount: 1,
          followingCount: 1,
          _id: 0,
        },
      },
    ];

    const follows:IFollows[] = await Follow.aggregate(followingsCalculation);
    


//followee's, followers count is updated
isUser.followers = follows[0]!.followersCount
//follower's, following count is updated
const currentUser = await User.findById(req.user._id)

if(!currentUser) return next(
  ApiError.notFound(404, `${req.originalUrl}`, "Cannot find current user")
);
currentUser.following = follows[0]!.followingCount

await isUser.save()
await currentUser.save()

//send notification
await sendNotification(isUser._id, `${req.user.userName} started following you.`, "Follow")
    
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            isUser,
            "User followed successfully"
          )
        );


})



export default followUser;
