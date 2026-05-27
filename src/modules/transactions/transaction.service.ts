import db from "../../database/db";
import type { TransactionRecord, WalletRecord } from "../../types";
import { AppError } from "../../utils/app-error";

export const getTransactionsForUser = async (userId: string): Promise<TransactionRecord[]> => {
  const wallet = await db<WalletRecord>("wallets").where({ user_id: userId }).first();

  if (!wallet) {
    throw new AppError("Wallet not found", 404);
  }

  return db<TransactionRecord>("transactions")
    .where({ wallet_id: wallet.id })
    .orderBy("created_at", "desc");
};
