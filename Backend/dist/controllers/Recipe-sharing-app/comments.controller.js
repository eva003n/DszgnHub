import Recipe from "../../models/Recipe-sharing-app/recipe.model.js";
import Comment from "../../models/Recipe-sharing-app/comment.model.js";
import ApiError from "../../utils/ApiError.js";
import { convertToObjectId } from "../../utils/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
const createComment = asyncHandler(async (req, res) => {
    //grecipe id to comment on
    const { id } = req.params;
    //comment metadata
    const { message, replyTo } = req.body;
    //make show that the provided is 24 characters long not more or less
    //check if the  recipe being commented on actually exists if not send an error
    const isExistingRecipe = await Recipe.findById(convertToObjectId(id));
    if (!isExistingRecipe) {
        return res.status(404).json(new ApiError(404, "Recipe not found"));
    }
    //validate the comment structure
    //comment creation
    const comment = await Comment.create({
        message,
        // author: req.user._id, //the currently logged in user
        recipeId: id, //recipe being commented on
        replyTo, //optional a comment can be a parent comment or a child
    });
});
export default createComment;
