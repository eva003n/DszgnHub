import { Schema, Model } from "mongoose";
import { options, recipeDatabase } from "./index.js";
import bcrypt from "bcryptjs";
import { NODE_ENV } from "../../config/env.js";
import logger from "../../logger/logger.winston.js";
import type { UserInterface, UserInterfaceMethods } from "../../interfaces/Recipe-sharing-app/model.interface.js";

//new mode; type that knows about instant methods
type UserModel = Model<UserInterface, {}, UserInterfaceMethods>
//user schema
const userSchema = new Schema<UserInterface, UserModel, UserInterfaceMethods>(
  //create uniwue indexes on username and password to prevent duplicates and improve query performance
  {
    userName: {
      type: String,
      trim: true,
      unique: true, //create unique index
      required: [true, "Username is required!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
      unique: true, // create unique index
      select: false,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters, got {VALUE}!"],
      required: [true, "Password is required!"],
      trim: true,
      default: ""
      // select: false, //prevent db from returning password unless we want it to
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
      type: [Schema.Types.ObjectId],
      ref: "Recipes", //favourite recipes model
    },
    socials: {
      facebook: String,
      instagram: String,
      twitter: String,
      tiktok: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },

  options
);

//before saving a document hash password
userSchema.pre("save", async function (next) {
  //checks if the provided path is modified then returns true  else if no argument is passed returns true for all paths

  //include the password field explicitly
  if (!this.isModified("password") || !this.password) {
    //passowrd not modified or empty
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
//instance methods only work with a model instanve
userSchema.methods.isMatchingPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password as string); //pass, saltvalue
};
//mark user as verified
userSchema.methods.setIsVerified = async function () {
  this.verified = true;
};
// update count of recipes created by current user
userSchema.methods.updatePostsCount = async function (
  userId: string,
  postCount: number
) {
  this.posts = postCount;
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

const User = recipeDatabase.model<UserInterface, UserModel>("User", userSchema);

if (NODE_ENV !== "development") {
  //ensures indexes are built
  User.createIndexes();
}

//index building status check
// User.on("index", (error) => {
//   if (error) {
//     logger.error(`Index creation error ${error.message}`);
//   }
//   logger.info("Successfull index building at User model");
// });

export default User;
