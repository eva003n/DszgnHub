import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2"
import { options, recipeDatabase } from "./index.js";
import type { NotificationInterface, RecipeModel } from "../../interfaces/Recipe-sharing-app/model.interface.js";

const notificationSchema = new Schema<NotificationInterface, RecipeModel>(
  {
    message: {
      type: String,
      required: [true, "Nitification message is required"],
    },
    recipe: {
      type: Schema.Types.ObjectId,
      required: true
    },
    
    receiver: {
      type: Schema.Types.ObjectId,
      required: [true, "Notification receiver  is required"],
      index: true
    },
    //comment, like,  follow
    notifyType: {
      type: String,
      required: [true, "Notification type is required"],
      enum: ["Like", "Comment", "Follow"]
    },
    isSeen: {
      type: Boolean,
      default: false
    }
  },
  options
);

notificationSchema.plugin(aggregatePaginate)
const Notification = recipeDatabase.model<NotificationInterface, RecipeModel>(
  "Notification",
  notificationSchema
);



export default Notification;
