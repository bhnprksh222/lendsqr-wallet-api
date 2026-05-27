import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { listTransactionsController } from "./transaction.controller";

const router = Router();

router.get("/", authenticate, listTransactionsController);

export default router;
