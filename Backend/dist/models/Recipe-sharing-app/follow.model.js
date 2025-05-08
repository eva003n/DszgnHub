import mongoose, { Schema } from "mongoose";
//change streams
/*
https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-36-change-streams.html#change-streams-in-mongoose
*/
const followerSchema = new Schema({
    //the person following
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    //person being followed
    followeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, {});
const Follow = mongoose.model("Follow", followerSchema);
export default Follow;
