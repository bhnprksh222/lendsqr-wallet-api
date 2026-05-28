import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import { getTransactionsForUser } from "./transaction.service";

const parsePositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const listTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 20), 100);
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    if (type && !["funding", "transfer", "withdrawal"].includes(type)) {
      throw new AppError("Invalid transaction type filter", 400);
    }

    if (status && !["pending", "successful", "failed"].includes(status)) {
      throw new AppError("Invalid transaction status filter", 400);
    }

    const transactions = await getTransactionsForUser(req.user!.id, {
      page,
      limit,
      type,
      status,
    });

    return res.status(200).json(transactions);
  } catch (error) {
    return next(error);
  }
};
