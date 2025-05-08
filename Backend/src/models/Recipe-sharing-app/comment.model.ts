import { Schema } from "mongoose";
import { options, recipeDatabase } from "./index.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import type { CommentInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import { NODE_ENV } from "../../config/env.js";

/**
 * comments research
  https://medium.com/@pmadhav279/building-dynamic-conversations-a-step-by-step-guide-to-implementing-a-nested-comment-system-in-56055a586a50
 */
const commentSchema = new Schema<CommentInterface>(
  {
    content: {
      type: String,
      required: [true, "Comment cannot be empty!"],
      trim: true,
      lowercase: true,
    },
    //the person making the comment
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    //recipe post
    recipe: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Recipe",
    },
    //parent comment
    replies: {
      type: [Schema.Types.ObjectId],
      ref: "Reply",
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  options
);

commentSchema.plugin(aggregatePaginate);
const Comment = recipeDatabase.model<CommentInterface>(
  "Comment",
  commentSchema
);

if (NODE_ENV !== "development") {
  //ensures indexes are built
  Comment.createIndexes();
}

export default Comment;
