import mongoose, { Schema } from "mongoose";
import { options } from "./index.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const recipeSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required!"],
        trim: true,
    },
    cuisineType: {
        type: String,
        lowercase: true,
        trim: true,
    },
    dietaryPreference: {
        type: String,
        lowercase: true,
        trim: true,
    },
    mealType: {
        type: String,
        lowercase: true,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, //link up the user with recipe post
        ref: "User",
        required: [true, "Recipe creator reqiured"],
    },
    ingredients: [
        {
            type: String,
            required: [true, "Ingredients is required!"],
        },
    ],
    instructions: [
        {
            type: String,
            required: [true, "Instructions are required!"],
        },
    ],
    images: [
        {
            _id: false,
            imageUrl: String,
            imageId: String
        }
    ],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0
    },
    tags: [
        {
            type: String,
            lowercase: true,
            trim: true,
        },
    ],
}, options);
recipeSchema.methods.updateRating = async function (rating) {
    this.rating = rating;
    return this.rating;
};
recipeSchema.plugin(aggregatePaginate);
const Recipe = mongoose.model("Recipe", recipeSchema);
//  recipeSchema.pre("save", function () {
//   this.post++;
//  })
export default Recipe;
