import { strict } from "node:assert";
import { z } from "zod";

const signUpSchema = z.object({
  userName: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(20),
  confirmPassword: z.string().min(8).max(20),
});
const logInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(20),
});

const recipeSchema = z.object({
  title: z.coerce.string().min(3).max(20),
  description: z.coerce.string().min(3).max(50),
  cuisineType: z.array(z.string()),
  dietaryPreference: z.string().min(3).max(20),
  mealType: z.string(),
  createdBy: z.string().min(24).max(24),
  ingredients: z.string(),
  instructions: z.string(),
  images: z.array(
    z.object({
      imageUrl: z.string().url(),
      imageId: z.string(),
    })
  ),
  rating: z.coerce.number().min(1).max(5),
  likes: z.coerce.number(),
  tags: z.array(z.string()),
});

const commentsSchema = z.object({
  content: z.string(),
  author: z.string().min(24).max(24),
  recipe: z.string().min(24).max(24),
  likes: z.number(),
});

const likeSchema = z.object({
  likedBy: z.string().min(24).max(24),
  recipe: z.string().min(24).max(24),
});

const ratingSchema = z.object({
  ratedBy: z.string().min(24).max(24),
  recipe: z.string().min(24).max(24),
  rating: z.number().min(1).max(5),
});

const notificationsSchema = z.object({
  message: z.string(),
  recipe: z.string().min(24).max(24),
  sender: z.string().min(24).max(24),
  receiver: z.string().min(24).max(24),
  notifyType: z.string(),
});

const followSchema = z.object({
  follower: z.string().min(24).max(24),
  followee: z.string().min(24).max(24),
});

const repliesSchema = z.object({
  content: z.string(),
  author: z.string().min(24).max(24),
  replyTo: z.string().min(24).max(24),
  likes: z.number(),
});

const userProfileSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(20),
  bio: z.string().min(3).max(50),
  experienceLevel: z.string().min(5).max(20),
  socials: z.object({
    facebook: z.string().url(),
    instagram: z.string().url(),
    twitter: z.string().url(),
    tiktok: z.string().url(),
  }),
});

const paramSchema = z.object({
  id: z.string().min(24).max(24),
  user_id: z.string().min(24).max(24),
  
})

const querySchema = z.object({
  q: z.string()
})

//convert from zod types to typescript types
//export types for the schemas
export type signUpAuth = z.infer<typeof signUpSchema>;
export type logInAuth = z.infer<typeof logInSchema>;
export type user = z.infer<typeof userProfileSchema>;
export type follow = z.infer<typeof followSchema>;
export type notify = z.infer<typeof notificationsSchema>;
export type rate = z.infer<typeof ratingSchema>;
export type like = z.infer<typeof likeSchema>;
export type comment = z.infer<typeof commentsSchema>;
export type reply = z.infer<typeof repliesSchema>;
export type param = z.infer<typeof paramSchema> 
export type reqQuery = z.infer<typeof querySchema>

//export the actual schema
export {
  signUpSchema,
  logInSchema,
  recipeSchema,
  followSchema,
  repliesSchema,
  ratingSchema,
  likeSchema,
  userProfileSchema,
  notificationsSchema,
  commentsSchema,
  paramSchema,
  querySchema
};
