import mongoose, { Schema } from "mongoose";
import { options } from "./index.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
/**
 * comments research
  https://medium.com/@pmadhav279/building-dynamic-conversations-a-step-by-step-guide-to-implementing-a-nested-comment-system-in-56055a586a50
 */
const commentSchema = new Schema({
    content: {
        type: String,
        required: [true, "Comment cannot be empty!"],
        trim: true,
        lowercase: true
    },
    //the person making the comment
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    //recipe post
    recipeId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "recipe"
    },
    //parent comment
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }
}, options);
commentSchema.plugin(aggregatePaginate);
const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
