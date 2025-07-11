import Recipe from "../../models/Recipe-sharing-app/recipe.model.js";
import Comment from "../../models/Recipe-sharing-app/comment.model.js";
import Rating from "../../models/Recipe-sharing-app/rating.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { convertToObjectId, formatError } from "../../utils/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import type {
  comment,
  requestParam,
} from "../../middlewares/validators/Recipe-sharing-app/index.js";
import Reply from "../../models/Recipe-sharing-app/reply.model.js";
import type { CommentInterface, ReplyInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import { sendNotification } from "./notifications.controller.js";
import type { ProtectedRequest } from "../../interfaces/Recipe-sharing-app/request.interface.js";

const createComment = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { content, author, replyTo }: comment = req.body;
    const { id } = req.params;
    //check if the  recipe being commented on actually exists if not send an error
    const isExistingRecipe = await Recipe.findById(id);
    if (!isExistingRecipe)
      return ApiError.notFound(
        404,
        `${req.originalUrl}`,
        "Recipe doesn't exists"
      );

    let comment:CommentInterface | ReplyInterface ;
    if (!replyTo) {
       comment = await Comment.create({
        content,
        recipe: id,
        author,
      });

      isExistingRecipe.comments.push(convertToObjectId(comment._id))
      await isExistingRecipe.save()
      
    } else {
  
      comment = await Reply.create({
        content,
        author,
      });
      const parentComment = await Comment.findById(replyTo);
      if (!parentComment)
        return next(
          ApiError.notFound(
            404,
            `${req.originalUrl}`,
            "Comment to reply to doen't exist"
          )
        );

      parentComment.replies.push(convertToObjectId(comment._id));
      await parentComment.save()
    }

    //send notification
    await sendNotification(req.user._id.toString(), `${req.user.userName} made a comment on your recipe.`, "Comment", isExistingRecipe._id.toString() )
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment created successfully"));
  }
);

export { createComment };
