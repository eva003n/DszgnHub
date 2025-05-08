import mongoose, { Schema } from "mongoose";
import { options } from "./index.js";
import bcrypt from "bcryptjs";
/*
_id: ObjectId Pk
  username: String
  email: String
  password: string
  isVerified: Boolean
  followers: number
  sillLevel: enum "Beginner", "Intermediate", "Professional"
  following: number
  favourites: [Objectid] favouritesRecipes

 */
//user schema
const userSchema = new Schema(
//create uniwue indexes on username and password to prevent duplicates and improve query performance
{
    userName: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true, //create unique index
    },
    email: {
        type: String,
        required: [true, "Password is required!"],
        trim: true,
        unique: true, // create unique index
        minlength: [8, "Email must have at least 8 characters, got {VALUE}!"],
        lowercase: true,
    },
    password: {
        type: String,
        minlength: [8, "Password must be at least 8 characters, got {VALUE}!"],
        required: [true, "Password is required!"],
        trim: true,
        select: false, //prevent db from returning password unless we want it to
    },
    bio: {
        type: String,
        default: "Add a bio...",
    },
    avatar: {
        imageUrl: String, //public url cloudinary
        imageId: String, //image id cloudinary for update
    },
    posts: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    followers: {
        type: Number,
        default: 0,
    },
    following: {
        type: Number,
        default: 0,
    },
    experienceLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Professional"], //predefined value
    },
    favourites: {
        type: Schema.ObjectId,
        ref: "FavouritesRecipes", //favourite recipes model
    },
}, options);
//validate always runs as the first pre save hook and is attached to schema by default meaning after validation we can catch end errors that occur
userSchema.post("validate", async (next) => {
    try {
    }
    catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
            next(e);
        }
    }
});
//before saving a document hash password
userSchema.pre("save", async function (next) {
    //checks if the provided path is modified then returns true  else if no argument is passed returns true for all paths
    if (!this.isModified("password")) { //passowrd not modified 
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
//instance methods only work with a model instanve
userSchema.methods.isMatchingPassword = async function (password) {
    return await bcrypt.compare(password, this.password); //pass, saltvalue
};
//mark user as verified
userSchema.methods.Verified = async function () {
    this.verified = true;
};
// update count of recipes created by current user
userSchema.methods.updatePostsCount = async function (userId, postCount) {
    this.findById(userId).post = postCount;
};
//statice method to reset password without ahaving to create  model instances, thus querying returns matching document
userSchema.statics.findUserAndresetPassword = async function (userId, newPassword) {
    this.findById(userId).password = newPassword; //this refers to User model
};
//moongoose automatically creates a virtual to get the id property(doc.id returns id )
//default user avatar
// userSchema
//   .virtual("shortname")
//   .get(function () {
//     return this.name.firstLetter + this.name.lastLetter;
//   })
//   .set(function (username) {
//     this.name.firstLetter = username.subStr(0, username.indexOf(" ")); //users firstname first letter
//     this.name.lastLetter = username.subStr(username.indexOf(" ") + 1); //users lastname firstletter
//   });
const User = mongoose.model("User", userSchema);
// //index building status check
// User.on("index", (error) => {
//   if (error) {
//     logger.error(`Index creation error ${error.message}`);
//   }
//   logger.info("Successfull index building at User model");
// });
export default User;
