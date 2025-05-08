import { Router } from "express";
import { protectRoute } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.js";
import { uploadMultipleFiles } from "../../middlewares/multer.middleware.js";

import {
  createRecipe,
  getAllRecipes,
  getSpecificRecipe,
  shareRecipe,
  searchRecipeByCriteria,
  saveFavoriteRecipe,
} from "../../controllers/Recipe-sharing-app/recipes.controller.js";
import rateRecipe from "../../controllers/Recipe-sharing-app/rate.controller.js";
import {createComment} from "../../controllers/Recipe-sharing-app/comments.controller.js";
import { paramSchema, ratingSchema, recipeSchema } from "../../middlewares/validators/Recipe-sharing-app/index.js";

const router = Router();

router.use(protectRoute);

// get all the recipes
// router.route("/").get(getAllRecipes);

//search for a recipe based on criteria
// router.route("/search").get(searchRecipeByCriteria);

// get details of a specific recipe
router.route("/:id").get(validate(paramSchema), getSpecificRecipe);

//create a new  recipe
router
  .route("/")
  .post(validate(recipeSchema),
  uploadMultipleFiles("image", 3), createRecipe);

//rate a recipe
router.route("/:id/rate").post(validate(ratingSchema),rateRecipe);

//comment on a recipe
router.route("/:id/comments").post(createComment);
//save a recipe to favourites
router.route("/:id/save").post(saveFavoriteRecipe);
//share a recipe
// router.route("/:id/share").get(shareRecipe);

export default router;
