import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createUserController, getMeController } from "./user.controller";
import { createUserSchema } from "./user.validation";

const router = Router();

router.post("/", validate(createUserSchema), createUserController);
router.get("/me", authenticate, getMeController);

export default router;
