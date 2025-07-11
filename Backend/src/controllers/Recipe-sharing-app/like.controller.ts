import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import Recipe from "../../models/Recipe-sharing-app/recipe.model.js";
import ApiError from "../../utils/ApiError.js";
import Like from "../../models/Recipe-sharing-app/like.model.js";
import type { Tlike } from "../../middlewares/validators/Recipe-sharing-app/index.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { sendNotification } from "./notifications.controller.js";
import type { ProtectedRequest } from "../../interfaces/Recipe-sharing-app/request.interface.js";

const likeRecipe = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { likedBy }: Tlike = req.body;

    //transaction
    const session = await Like.startSession();
    session.startTransaction();

    const isExistingRecipe = await Recipe.findById(id).session(session);
    if (!isExistingRecipe) {
      // await session.abortTransaction();
      // await session.endSession();
      return next(
        ApiError.notFound(404, `${req.originalUrl}`, "Recipe does not exist")
      );
    }



    //prevent liking a recipe more than once
    const isAlreadyLiked = await Like.findOne({
      $and: [{ likedBy: likedBy }, { recipe: id }],
    }).session(session);
    //delete the like | unlike
    if (isAlreadyLiked) {
      const removedLike = await Like.deleteOne({
        $and: [{ likedBy: likedBy }, { recipe: id }],
      });

      isExistingRecipe.likes ? (isExistingRecipe.likes -= 1) : 0;
      await isExistingRecipe.save();

      session.commitTransaction();
      session.endSession();

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Recipe unliked successfully"));
    }
    const like = await Like.create([{ likedBy, recipe: id }], { session });

    //commit and end transaction
    await session.commitTransaction();
    await session.endSession();


    //update the likes count on the recipe
    const likeCount = await Like.find({ recipe: id }).countDocuments();
    
  
    isExistingRecipe.likes = likeCount;
    await isExistingRecipe.save();

    //send a notification to the author of the recipe
    await sendNotification(
      isExistingRecipe.createdBy.toString(),
      `${req.user.userName} liked the ${isExistingRecipe.title} recipe`,
      "Like",
      isExistingRecipe._id.toString()
    );

    return res
      .status(201)
      .json(new ApiResponse(201, like, "Recipe liked successfully"));
  }
);

export { likeRecipe };
