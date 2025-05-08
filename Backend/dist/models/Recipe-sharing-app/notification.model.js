import mongoose, { Schema } from "mongoose";
import { options } from "./index.js";
const notificationSchema = new Schema({
    message: {
        type: String,
        required: [true, "Message is required"]
    },
    //main resource
    recipeId: {
        type: mongoose.Schema.ObjectId,
        required: [true, "RecipeId is required"],
    },
    senderId: {
        type: mongoose.Schema.ObjectId,
        required: [true, "UserId is required"],
    },
    receiverTd: {
        type: mongoose.Schema.ObjectId,
        required: [true, "UserId is required"],
    },
    //comment made, received a follow or received a  like
    notificationType: {
        type: String,
        required: [true, "Notification type is required"]
    }
}, options);
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
