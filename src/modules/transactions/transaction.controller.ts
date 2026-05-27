import type { NextFunction, Request, Response } from "express";
import { getTransactionsForUser } from "./transaction.service";

export const listTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const transactions = await getTransactionsForUser(req.user!.id);
    return res.status(200).json({ data: transactions });
  } catch (error) {
    return next(error);
  }
};
