import { Router } from "express";
import { createRecipe, saveFavoriteRecipe, } from "../../controllers/Recipe-sharing-app/recipes.controller.js";
import rateRecipe from "../../controllers/Recipe-sharing-app/rate.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";
import createComment from "../../controllers/Recipe-sharing-app/comments.controller.js";
import { uploadMultipleFiles } from "../../middlewares/multer.middleware.js";
const router = Router();
//use the auth middleware to protect all the recipe routes
router.use(protectRoute);
// get all the recipes
// router.route("/").get(getAllRecipes);
//search for a recipe based on criteria
// router.route("/search").get(searchRecipeByCriteria);
//get details of a specific recipe
// router.route("/:id").get(getSpecificRecipe);
//create a new  recipe
router
    .route("/")
    .post(uploadMultipleFiles("image", 3), createRecipe);
//rate a recipe
router.route("/:id/rate").post(rateRecipe);
//comment on a recipe
router.route("/:id/comments").post(createComment);
//save a recipe to favourites
router.route("/:id/save").post(saveFavoriteRecipe);
//share a recipe
// router.route("/:id/share").get(shareRecipe);
export default router;
