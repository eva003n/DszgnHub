import mongoose, { Model, Schema } from "mongoose";
import { options, recipeDatabase } from "./index.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import type { RecipeInterface, RecipeMethods } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import { NODE_ENV } from "../../config/env.js";

type RecipeModel = Model<RecipeInterface, RecipeMethods>
const recipeSchema = new Schema<RecipeInterface, RecipeModel, RecipeMethods>(
  {
    title: {
      type: String,
      required: [true, "Title is required!"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
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
      type: Schema.Types.ObjectId, //link up the user with recipe post
      ref: "User",
      required: [true, "Recipe creator required"],
    },

    ingredients: [
      {
        type: String,
        required: [true, "Ingredients is required!"],
      },
    ],
    instructions: {
      type: String,
      required: [true, "Instructions are required!"],
    },

    images: [
      {
        _id: false,
        imageUrl: String,
        imageId: String,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  options
);

recipeSchema.methods. updateRatingsCount = async function (rating: number) {
  this.rating = rating;
};
recipeSchema.plugin(aggregatePaginate);
const Recipe = recipeDatabase.model<RecipeInterface, RecipeModel>("Recipe", recipeSchema);

if (NODE_ENV !== "development") {
  //ensures indexes are built
  Recipe.createIndexes();
}
export default Recipe;
