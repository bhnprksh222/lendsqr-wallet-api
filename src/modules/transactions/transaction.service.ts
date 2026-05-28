import db from "../../database/db";
import type { TransactionRecord, WalletRecord } from "../../types";
import { AppError } from "../../utils/app-error";

type TransactionQuery = {
  page: number;
  limit: number;
  type?: string;
  status?: string;
};

type PaginatedTransactions = {
  data: TransactionRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const getTransactionsForUser = async (
  userId: string,
  query: TransactionQuery,
): Promise<PaginatedTransactions> => {
  const wallet = await db<WalletRecord>("wallets").where({ user_id: userId }).first();

  if (!wallet) {
    throw new AppError("Wallet not found", 404);
  }

  const baseQuery = db<TransactionRecord>("transactions").where({ wallet_id: wallet.id });

  if (query.type) {
    baseQuery.andWhere({ type: query.type });
  }

  if (query.status) {
    baseQuery.andWhere({ status: query.status });
  }

  const [{ total }] = await baseQuery.clone().count<{ total: number | string }[]>({ total: "*" });
  const totalCount = Number(total);
  const totalPages = Math.max(Math.ceil(totalCount / query.limit), 1);
  const offset = (query.page - 1) * query.limit;
  const data = await baseQuery.clone().orderBy("created_at", "desc").limit(query.limit).offset(offset);

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total: totalCount,
      totalPages,
    },
  };
};
