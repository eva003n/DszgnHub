import { NODE_ENV } from "../../config/env.js";
import type { FollowInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import { options, recipeDatabase } from "./index.js";
import mongoose, { Schema } from "mongoose";

//change streams
/*
https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-36-change-streams.html#change-streams-in-mongoose
*/

const followsSchema = new Schema<FollowInterface>(
  {
    //the person following
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    //person being followed
    followee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  options
);
const Follow = recipeDatabase.model<FollowInterface>("Follow", followsSchema);

if (NODE_ENV !== "development") {
  //ensures indexes are built
  Follow.createIndexes();
}
export default Follow;
