import { Schema } from "mongoose";
import { options, recipeDatabase } from "./index.js";
import type { LikeInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import { NODE_ENV } from "../../config/env.js";

const likeSchema = new Schema<LikeInterface>(
  {
    //person who liked
    likedBy: {
      type: Schema.Types.ObjectId,
      required: [true, "UserId is required"],
      ref: "User",
    },
    //the recipe being liked
    recipe: {
      type: Schema.Types.ObjectId,
      required: [true, "RecipeId is required"],
      ref: "Recipe",
    },
  },
  options
);

const Like = recipeDatabase.model<LikeInterface>("Like", likeSchema);

if (NODE_ENV !== "development") {
  //ensures indexes are built
  Like.createIndexes();
}
export default Like;
