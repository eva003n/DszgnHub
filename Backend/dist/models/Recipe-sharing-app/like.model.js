import mongoose, { Schema } from "mongoose";
import { options } from "./index.js";
const likeSchema = new Schema({
    //person who liked
    likedBy: {
        type: mongoose.Schema.ObjectId,
        required: [true, "UserId is required"],
        ref: "User"
    },
    //the recipe being liked
    recipeId: {
        type: mongoose.Schema.ObjectId,
        required: [true, "RecipeId is required"],
        ref: "Recipe"
    }
}, options);
const Like = mongoose.model("Like", likeSchema);
export default Like;
