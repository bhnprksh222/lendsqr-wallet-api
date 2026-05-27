import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  fundWalletController,
  getMyWalletController,
  transferWalletController,
  withdrawWalletController,
} from "./wallet.controller";
import { amountSchema, transferSchema } from "./wallet.validation";

const router = Router();

router.use(authenticate);
router.get("/me", getMyWalletController);
router.post("/fund", validate(amountSchema), fundWalletController);
router.post("/transfer", validate(transferSchema), transferWalletController);
router.post("/withdraw", validate(amountSchema), withdrawWalletController);

export default router;
