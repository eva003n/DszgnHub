import Recipe from "../../models/Recipe-sharing-app/recipe.model.js";
import { convertToObjectId } from "../../utils/index.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/Recipe-sharing-app/user.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
//create a recipe
const createRecipe = asyncHandler(async (req, res, next) => {
    const { title, dietaryPreference, cuisineType, ingredients, mealType, instructions, tags, } = req.body;
    // const { error } = recipesSchema.validate({
    //   title,
    //   dietaryPreference,
    //   cuisineType,
    //   ingredients,
    //   mealType,
    //   instructions,
    //   tags,
    // });
    // //validation error
    // if (error) {
    //   return res.status(400).json(new ApiError(400, e.message));
    // }
    // //upload image files to cloudinary
    // const uploadedImages = await cloudinary.uploader.upload([]);
    // // get needded response from clouidinary
    // const imageData = uploadedImages.map((uploadmage:any) => {
    //   return {
    //     imageUrl: uploadmage.secure_url,
    //     imageId: uploadmage.public_id,
    //   };
    // });
    //get all properties in the body
    const createdRecipe = await Recipe.create({
        title,
        dietaryPreference,
        cuisineType,
        ingredients,
        mealType,
        instructions,
        tags,
        // createdBy: req.user._id,
        // images: imageData,
    });
    // update posts count of current user
    const updated = await User.findOneAndUpdate(
    // { _id: req.user._id },
    // { posts: post.postsCount }
    );
    return res
        .status(200)
        .json(new ApiResponse(200, createdRecipe, "Recipe created successfully"));
});
const recipeLookUp = {
    $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "publishedBy",
        pipeline: [
            {
                $project: {
                    userName: 1,
                    _id: 1,
                },
            },
        ],
    },
};
const recipeProjection = {
    $project: {
        _id: 1,
        title: 1,
        cuisineType: 1,
        instructions: 1,
        ingredients: 1,
        dietaryPreference: 1,
        publishedBy: 1,
        image: 1,
        tags: 1,
        mealType: 1,
    },
};
const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({}, { updatedAt: 0, createdAt: 0, __v: 0 })
            .populate({ path: "createdBy", select: "userName likes _id" })
            .sort({ createdAt: -1 })
            .exec();
        if (recipes) {
            return res.status(200).json(recipes);
        }
    }
    catch (e) {
        return res.status(500).json({
            message: `Error fetching recipes!`,
        });
    }
};
const getSpecificRecipe = async (req, res) => {
    const { id } = req.params;
    try {
        const recipePipeline = [
            {
                $match: {
                    //convert to object id
                    _id: convertToObjectId(id),
                },
            },
            recipeLookUp,
            recipeProjection,
        ];
        const matchingRecipe = await Recipe.aggregate(recipePipeline).exec();
        if (matchingRecipe.length !== 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, matchingRecipe, "Recipe fetched successfully"));
        }
        else {
            return res
                .status(400)
                .json(new ApiError(400, "Ooops! No matching recipes found"));
        }
    }
    catch (e) {
        // console.log(`Error!${e.message}`);
        return res.status(500).json({
            message: "Error fetching recipe!",
        });
    }
};
//rating a specific  a recipe
//saving favourite recipes
const saveFavoriteRecipe = async (req, res) => {
    const { id } = req.params;
};
//get all recipes
//search based on keywords eg mealtype, tags, ingredients, dietaryPreference,cuisine types
const searchRecipeByCriteria = async (req, res) => {
    const { filter } = req.query;
    const pipeline = [
        {
            $search: {
                index: "recipe",
                text: {
                    query: filter,
                    path: ["ingredients", "dietaryPreference", "cuisineTYpes", "title"],
                    fuzzy: {},
                },
                highlight: {
                    path: ["ingredients", "dietaryPreference", "cuisineTYpes", "title"],
                },
            },
        },
        recipeLookUp,
        {
            $project: {
                title: 1,
                ingredients: 1,
                instructions: 1,
                dietaryPreference: 1,
                tags: 1,
                "publishedBy.userName": 1,
                "publishedBy._id": 1,
                image: 1,
                rating: 1,
                mealType: 1,
                cuisineType: 1,
                score: {
                    $meta: "searchScore",
                },
                highlight: {
                    $meta: "searchHighlights",
                },
            },
        },
    ];
    try {
        const searchRecipeResults = await Recipe.aggregate(pipeline);
    }
    catch (e) {
        return res.status(500).json(new ApiError(500, "Error while searching"));
    }
};
//get recipe created by user | user id
const getRecipesCreatedByUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const recipeAggregation = [
            {
                $match: {
                    createdBy: convertToObjectId(user_id),
                },
            },
            recipeLookUp,
            {
                $sort: {
                    _id: -1,
                },
            },
            recipeProjection,
        ];
        const userRecipes = await Recipe.aggregate([]).exec();
        if (!userRecipes.length) {
            return res
                .status(404)
                .json(new ApiError(404, "Ooops user doesn't exist"));
        }
        return res
            .status(200)
            .json(new ApiResponse(200, userRecipes, "Recipes fetched successfully"));
    }
    catch (e) {
    }
};
const shareRecipe = async (req, res) => {
    let { id } = req.params;
    try {
        const recipeAggregation = [
            {
                $match: {
                    _id: convertToObjectId(id),
                },
            },
            recipeLookUp,
            recipeProjection,
        ];
        const recipeToShare = await Recipe.aggregate(recipeAggregation).exec();
        if (recipeToShare.length) {
            return res
                .status(200)
                .json(new ApiResponse(200, recipeToShare, "Recipes fetched successfully"));
        }
        else {
            return res
                .status(404)
                .json(new ApiError(404, "Ooops! No matching recipes found"));
        }
    }
    catch (e) {
    }
};
export { createRecipe, getRecipesCreatedByUser, getAllRecipes, getSpecificRecipe, searchRecipeByCriteria, saveFavoriteRecipe, shareRecipe, };
