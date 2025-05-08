import mongoose, { Schema } from "mongoose";
import { options, recipeDatabase } from "./index.js";
import type { NotificationInterface } from "../../interfaces/Recipe-sharing-app/model.interface.js";
import { NODE_ENV } from "../../config/env.js";

const notificationSchema = new Schema<NotificationInterface>(
  {
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    //main resource
    recipe: {
      type: Schema.Types.ObjectId,
      required: [true, "RecipeId is required"],
    },

    sender: {
      type: Schema.Types.ObjectId,
      required: [true, "UserId is required"],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: [true, "UserId is required"],
    },
    //comment made, received a follow or received a  like
    notifyType: {
      type: String,
      required: [true, "Notification type is required"],
    },
  },
  options
);

const Notification = recipeDatabase.model<NotificationInterface>(
  "Notification",
  notificationSchema
);

if (NODE_ENV !== "development") {
  //ensures indexes are built
  Notification.createIndexes();
}

export default Notification;
