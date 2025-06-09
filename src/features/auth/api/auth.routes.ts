import { Router } from "express";
import { userLoginController, userSignupController } from "./authController";
const router = Router();

router.post('/signup',userSignupController);
router.post('/login',userLoginController);

export default router;