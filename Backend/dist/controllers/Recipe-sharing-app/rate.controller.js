import Rating from "../../models/Recipe-sharing-app/rating.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { convertToObjectId } from "../../utils/index.js";
import Recipe from "../../models/Recipe-sharing-app/recipe.model";
const rateRecipe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;
    //validate id params length
    //prevent current user from rating more than once
    const isRatedByUser = await Rating.findOne({
        recipeId: convertToObjectId(id),
        // userId: req.user._id,
    });
    if (isRatedByUser) {
        return res.status(409).json(new ApiError(409, "Recipe already rated"));
    }
    // const { error } = ratingSchemaValidator.validate({ rating });
    // //validation error
    // if (error) {
    //   return res
    //     .status(400)
    //     .json(new ApiError(400, formatError(error.massage)));
    // }
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
    const recipeAverageRating = await Rating.aggregate(averageRatingPipeline).exec();
    if (Array.isArray(recipeAverageRating) && recipeAverageRating.length > 0) {
        const isUpdated = await Recipe.findOneAndUpdate({ _id: convertToObjectId(id) }, { $set: { rating: recipeAverageRating[0].averageRating } }, { new: true }).exec();
        if (isUpdated) {
            return res
                .status(200)
                .json(new ApiResponse(200, { averageRating: isUpdated.rating }, "Recipe rated successfully"));
        }
    }
    else {
        return res.status(404).json(new ApiError(404, "Recipe not found"));
    }
});
export default rateRecipe;
