import { Router } from "express";
import { validate } from "../../middlewares/validator.js";
import { logInSchema, signUpSchema } from "../../middlewares/validators/Recipe-sharing-app/index.js";
import { signUp, logIn, logOut, tokenRefresh, sendVerificationCode  } from "../../controllers/Recipe-sharing-app/auth.controller.js";


 const router  = Router();
//allowing field input data only
router.route("/sign-up").post(validate(signUpSchema), signUp);
router.route("/log-in").post(validate(logInSchema), logIn);
router.route("/log-out").delete(logOut);
router.route("/refresh-token").post(tokenRefresh);

router.route("/resend-verificaton-code").get(sendVerificationCode);

export default router;



