import { Router } from "express";
import { signUp, logIn, logOut, tokenRefresh, } from "../../controllers/Recipe-sharing-app/auth.controller.js";
const router = Router();
//allowing field input data only
router.route("/signup").post(signUp);
router.route("/login").post(logIn);
router.route("/logout").delete(logOut);
router.route("/refreshtoken").post(tokenRefresh);
export default router;
