import { Router } from "express";
import { protectRoute } from "../../middlewares/auth.middleware.js";
import { getNofications } from "../../controllers/Recipe-sharing-app/notifications.controller.js";
const router = Router();
//use the auth middleware to protect all the notification routes
router.use(protectRoute);
router.route("/").get(getNofications);
export default router;
