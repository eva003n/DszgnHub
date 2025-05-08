import { Router } from "express";
import { protectRoute } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.js";
import { notificationsSchema } from "../../middlewares/validators/Recipe-sharing-app/index.js";
import { getNofications } from "../../controllers/Recipe-sharing-app/notifications.controller.js";


const router = Router();
//use the auth middleware to protect all the notification routes
router.use(protectRoute as (req: any, res: any, next: any) => void);

router.route("/").get( validate(notificationsSchema),getNofications)

export default router;