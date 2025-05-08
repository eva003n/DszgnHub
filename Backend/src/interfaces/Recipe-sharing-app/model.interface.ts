import {  Types } from "mongoose";
interface UserInterface {
  _id: string;
  userName: string;
  email: string;
  password: string | undefined;
  verified: boolean;
  followers: number;
  following: number;
  favourites: Types.ObjectId[];
  posts: number;
  likes: number;
  avatar: {
    imageUrl: string;
    imageId: string;
  };
  experienceLevel: string;
  bio: string;
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
  };
  refreshToken: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  // isMatchingPassword(password: string): Promise<boolean>;
}
interface UserInterfaceMethods {
  isMatchingPassword(password: string): Promise<boolean>;
  updatePostsCount(userId: string, postCount: number): void;
  setIsVerified(userId: string): void;
}
interface RecipeInterface {
  _id: string;
  title: string;
  description: string;
  cuisineType: string;
  dietaryPreference: string;
  mealType: string;
  createdBy: Types.ObjectId;
  ingredients: string[];
  instructions: string;
  images: object[];
  rating: number;
  likes: number;
  tags: string[];
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
interface RecipeMethods {
  updateLikesCount(likeCount: number): void;
  updateRatingsCount(ratingCount: number): void;
}

interface CommentInterface {
  _id: string;
  content: string;
  author: Types.ObjectId;
  recipe: Types.ObjectId;
  replies: Types.ObjectId[];
  likes: number;
}

interface FollowInterface {
  _id: string;
  follower: Types.ObjectId;
  followee: Types.ObjectId;
}

interface LikeInterface {
  _id: string;
  likedBy: Types.ObjectId;
  recipe: Types.ObjectId;
}

interface NotificationInterface {
  _id: string;
  message: string;
  recipe: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  notifyType:string;
}

interface RateInterface {
  _id: string;
  ratedBy: Types.ObjectId;
  recipe: Types.ObjectId;
  rating: number;
}

interface ReplyInterface {
  _id: string;
  content: string;
  author: Types.ObjectId;
  replyTo:Types.ObjectId;
  likes: number;
}
export type {
  UserInterface,
  RecipeInterface,
  CommentInterface,
  FollowInterface,
  LikeInterface,
  NotificationInterface,
  RateInterface,
  ReplyInterface,
  UserInterfaceMethods,
  RecipeMethods
};
