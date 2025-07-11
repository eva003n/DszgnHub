import type { Request, Response, NextFunction } from "express";
import Rating from "../../models/Recipe-sharing-app/rating.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { convertToObjectId, formatError } from "../../utils/index.js";
import Recipe from "../../models/Recipe-sharing-app/recipe.model.js";
import type { rate } from "../../middlewares/validators/Recipe-sharing-app/index.js";
import type { IRating } from "../../interfaces/Recipe-sharing-app/rate.interface.js";

const rateRecipe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { rating, ratedBy }: rate = req.body;

    //transaction
    const session = await Rating.startSession();
    session.startTransaction();

    //prevent current user from rating more than once
    const isRated = await Rating.findOne({
      $and: [{ recipe: id }, { ratedBy: ratedBy }],
    }).session(session);

    if (isRated) {
      await session.abortTransaction();
      await session.endSession();
      return next(
        ApiError.conflictRequest(
          409,
          `${req.originalUrl}`,
          "Recipe already rated"
        )
      );
    }
    const recipeRating = await Rating.create(
      [
        {
          recipe: id as string,
          ratedBy,
          rating,
        },
      ],
      { session }
    );

    // recipeRating.populate(["ratedBy, +userName ", "recipe, +title +rating"]);
    const averageRatingPipeline = [
      //fin all the all recipes with the id that have being rated
      {
        $match: {
          recipe: convertToObjectId(id as string),
        },
      },
      //group the ratings for a specific recipe  and calculate their avarage
      {
        $group: {
          _id: "$recipe",
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

    const recipeAverageRating = await Rating.aggregate<IRating>(
      averageRatingPipeline
    ).session(session);

    const recipe = await Recipe.findById(id).session(session);
    if (!recipe) {
     await session.abortTransaction();
     await session.endSession();
      return next(
        ApiError.notFound(404, `${req.originalUrl}`, "Recipe doesn't exist")
      );
    }

    if (!recipeAverageRating) {
      recipe.rating = recipeAverageRating[9]["averageRating"];
      await recipe.save();
      
      session.commitTransaction();
      session.endSession();
    }

    return res
      .status(201)
      .json(new ApiResponse(200, recipe, "Recipe rated successfully"));
  }
);

export default rateRecipe;
