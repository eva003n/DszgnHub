import { Router } from "express";
import { protectRoute } from "../../middlewares/auth.middleware.js";
import {
  getProfileDetails,
  createProfile,
  updateProfile,
} from "../../controllers/Recipe-sharing-app/users.controller.js";
import followUser from "../../controllers/Recipe-sharing-app/follow.controller.js";
import { getRecipesCreatedByUser } from "../../controllers/Recipe-sharing-app/recipes.controller.js";
import { uploadSingleFile } from "../../middlewares/multer.middleware.js";

const router = Router();

//use protect route as a global middleware for all the routes in this file
router.use(protectRoute);
// user create profile only when authenticated

router.route("/").post(uploadSingleFile("avatar"), createProfile);

//get user profile details
router.route("/profile").get(getProfileDetails);

//get recipe published by user
// router.route("/:user_id/recipes").get(getRecipesCreatedByUser);

//follow another user
router.route("/:user_id/follow").post(followUser);

//update user profile details
router.route("/profile").put(uploadSingleFile("avatar"), updateProfile);
export default router;
