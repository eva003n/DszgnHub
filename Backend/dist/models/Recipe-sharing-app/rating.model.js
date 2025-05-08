import { options } from "./index.js";
import mongoose, { Schema } from "mongoose";
const ratingSchema = new Schema({
    //current user rating recipe
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "UserId is required"],
    },
    recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "recipeid is required"],
    },
    rating: {
        type: Number,
        min: [1, "Rating must be between 1 and 5"],
        max: [5, "Rating must be between 1 and 5"],
        required: [true, "Rating is required"],
        default: 0
    },
}, options);
const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
