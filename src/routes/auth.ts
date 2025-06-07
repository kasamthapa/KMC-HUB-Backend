import { Router } from "express";
import { userLoginController, userSignupController } from "../controllers/userController";
const router = Router();

router.post('/signup',userSignupController);
router.post('/login',userLoginController);

export default router;