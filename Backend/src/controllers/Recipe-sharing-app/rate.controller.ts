
import type { Request, Response, NextFunction } from "express";
import Rating from "../../models/Recipe-sharing-app/rating.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { convertToObjectId, formatError } from "../../utils/index.js";
import Recipe from "../../models/Recipe-sharing-app/recipe.model.js";
import type { param, rate } from "../../middlewares/validators/Recipe-sharing-app/index.js";

 const rateRecipe = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
  const { id } = req.params as param;
  const { rating } = req.body as rate;

    //prevent current user from rating more than once
    const isRatedByUser = await Rating.findOne({
      recipeId: convertToObjectId(id),
      // userId: req.user._id,
    });

    if (isRatedByUser) 
      return next(ApiError.conflictRequest(409, "Recipe already rated"));
  
    const recipeRating = await Rating.create({
      // userId: req.user._id || "",
      recipeId: id,
      rating,
    });

    const averageRatingPipeline = [
      //fin all the all recipes with the id that have being rated
      {
        $match: {
          recipeId: convertToObjectId(id),
        },
      },
      //grooup them and calculate their avarage
      {
        $group: {
          _id: "$recipeId",
          averageRating: {
            $avg: "$rating",
          },
        },
      },

      {
        $project: {
          _id: 0,
          averageRating: 1,
        },
      },
    ];

    const recipeAverageRating = await Rating.aggregate(
      averageRatingPipeline
    ).exec();

    if (Array.isArray(recipeAverageRating) && recipeAverageRating.length > 0) {
      const updatedRecipe = await Recipe.findOneAndUpdate(
        { _id: convertToObjectId(id) },
        { $set: { rating: recipeAverageRating[0].averageRating } },
        { new: true }
      );

        return res
          .status(201)
          .json(
            new ApiResponse(
              200,
              updatedRecipe,
              "Recipe rated successfully"
            )
          );
        }else {
          return res
          .status(201)
          .json(
            new ApiResponse(
              200,
              updatedRecipe,
              "Recipe rated successfully"
            ))

        }
  
})

export default rateRecipe;
