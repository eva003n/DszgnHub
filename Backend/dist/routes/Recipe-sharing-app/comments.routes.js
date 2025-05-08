import { Router } from "express";
import createComment from "../../controllers/Recipe-sharing-app/comments.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";
const router = Router();
router.use(protectRoute);
router.route("/").post(createComment);
export default router;
