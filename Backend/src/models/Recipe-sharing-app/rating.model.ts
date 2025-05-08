import { NODE_ENV } from "../../config/env.js";
import type { RateInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import { options, recipeDatabase } from "./index.js";
import mongoose, { Schema } from "mongoose";

const ratingSchema = new Schema<RateInterface>(
  {
    //current user rating recipe
    ratedBy: {
      type: Schema.Types.ObjectId,
      required: [true, "UserId is required"],
    },
    recipe: {
      type: Schema.Types.ObjectId,
      required: [true, "recipeid is required"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
      required: [true, "Rating is required"],
      default: 0,
    },
  },
  options
);
const Rating = recipeDatabase.model<RateInterface>("Rating", ratingSchema);

if (NODE_ENV !== "development") {
  //ensures indexes are built
  Rating.createIndexes();
}
export default Rating;
