import express from "express";
import cors from "cors";
import helmet from "helmet";
import transactionRoutes from "./modules/transactions/transaction.routes";
import userRoutes from "./modules/users/user.routes";
import walletRoutes from "./modules/wallets/wallet.routes";
import { notFoundHandler } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "lendsqr-wallet-api",
  });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/wallets", walletRoutes);
app.use("/api/v1/transactions", transactionRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(notFoundHandler);

export default app;
