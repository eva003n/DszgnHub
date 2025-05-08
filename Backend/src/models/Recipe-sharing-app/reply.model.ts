import mongoose, { Schema } from "mongoose";
import { options, recipeDatabase } from "./index.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import type { ReplyInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import { NODE_ENV } from "../../config/env.js";

/**
 * comments research
  https://medium.com/@pmadhav279/building-dynamic-conversations-a-step-by-step-guide-to-implementing-a-nested-comment-system-in-56055a586a50
 */
const repliesSchema = new Schema<ReplyInterface>(
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
      // required: ["true", "author of comment is required!"],
      ref: "User",
    },

    //parent comment
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      // required: ["true", "Comment being replied to is required!"]
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  options
);

repliesSchema.plugin(aggregatePaginate);
const Reply = recipeDatabase.model<ReplyInterface>("Replies", repliesSchema);
if (NODE_ENV !== "development") {
  //ensures indexes are built
  Reply.createIndexes();
}
export default Reply;
