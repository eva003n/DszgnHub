import Recipe from "../../models/Recipe-sharing-app/recipe.model.js";
import Comment from "../../models/Recipe-sharing-app/comment.model.js";
import Rating from "../../models/Recipe-sharing-app/rating.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { convertToObjectId, formatError } from "../../utils/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { comment } from "../../middlewares/validators/Recipe-sharing-app/index.js";

const createComment = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
  const { id } = req.params;
  const { content, author } = req.body as comment;
  //check if the  recipe being commented on actually exists if not send an error
  const isExistingRecipe = await Recipe.findById(id).exec();
  if (!isExistingRecipe) 
    return ApiError.notFound(404, "Recipe not found")
  
  const comment = await Comment.create({
    content,
    recipe: id, 
    author, 
  });

return res.status(200).json(new ApiResponse(200, comment, "Comment created successfully"))

});

export {createComment};
