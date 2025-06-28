import { authAll } from './../../../middlewares/AuthMiddleware';
import { Router } from "express";
import { getCurrentUser, userLoginController, userSignupController } from "./authController";
const router = Router();

router.post('/signup',userSignupController);
router.post('/login',userLoginController);
router.get('/me',authAll,getCurrentUser)

export default router;