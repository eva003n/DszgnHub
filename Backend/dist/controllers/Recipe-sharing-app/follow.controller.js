import User from "../../models/Recipe-sharing-app/user.model.js";
import Follow from "../../models/Recipe-sharing-app/follow.model.js";
import { convertToObjectId } from "../../utils/index.js";
import { getUser } from "./users.controller.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
const followUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    //check if user to be followed actually exists
    const isUser = await User.findById(user_id).exec();
    if (!isUser)
        return res.status(404).json(new ApiError(404, "User does not exist"));
    //prevent the currently logged in user from following themselves
    //mongoose.Types.ObjectId
    //the comaprison only works when they are strings since equality checks on objects compare references rather than value
    // if (user_id.toString() === req.user._id.toString()) {
    //   return res
    //     .status(422)
    //     .json(new ApiError(422, "You cannot follow yourself"));
    // }
    //if follow already exists delete it to implement unfollow
    const isExistingFollow = await Follow.findOneAndDelete({
        $and: [
            {
            // followerId: req.user._id, //currently logged in user
            },
            {
                followeeId: convertToObjectId(user_id), // following same persion
            },
        ],
    }, { __v: 0 });
    //get followed user
    const followedUser = await getUser(user_id);
    //if its an existing follow implement unfollow logic by deleting it
    if (isExistingFollow)
        return res
            .status(200)
            .json(new ApiResponse(200, isExistingFollow, `Unfollowed ${[]} successfully`));
    //if its not an existibg follow create follow
    const createFollow = await Follow.create({
        // followerId: req.user._id,
        followeeId: convertToObjectId(user_id),
    });
    //update followers and following count
    //calculate the followers and followings and update user profile
    const followingsCalculation = [
        {
            //all docs of the filter docs where currently logged in user is either a follower or is being followed
            $match: {
                $or: [
                    {
                    // followerId: req.user._id,
                    },
                    {
                    // followeeId: req.user._id,
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
                            // $eq: ["$followeeId", req.user._id],
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
                            // $eq: ["$followerId", req.user._id],
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
                following: true,
                _id: 0,
            },
        },
    ];
    const follows = await Follow.aggregate(followingsCalculation);
    //update the follow metrics for the current user
    const [follow] = follows;
    const currentUser = await User.findOneAndUpdate(
    // { _id: req.user._id },
    {
        $set: {
            followers: follow.followersCount,
            following: follow.followingCount,
        },
    }, { new: true });
    if (createFollow && follows) {
        return res
            .status(201)
            .json(new ApiResponse(201, follows));
    }
    else {
        throw new Error("Something went wrong");
    }
});
export default followUser;
