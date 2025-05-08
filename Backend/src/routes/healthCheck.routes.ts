import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controller.ts";

const router = Router()

router.route("/").get(healthCheck)

export default router;