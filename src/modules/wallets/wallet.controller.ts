import type { NextFunction, Request, Response } from "express";
import { fundWallet, getMyWallet, transferFunds, withdrawFromWallet } from "./wallet.service";

export const getMyWalletController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const wallet = await getMyWallet(req.user!.id);
    return res.status(200).json({ data: wallet });
  } catch (error) {
    return next(error);
  }
};

export const fundWalletController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const wallet = await fundWallet({ userId: req.user!.id, ...req.body });
    return res.status(200).json({ message: "Wallet funded successfully", data: wallet });
  } catch (error) {
    return next(error);
  }
};

export const withdrawWalletController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const wallet = await withdrawFromWallet({ userId: req.user!.id, ...req.body });
    return res.status(200).json({ message: "Wallet debited successfully", data: wallet });
  } catch (error) {
    return next(error);
  }
};

export const transferWalletController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await transferFunds({ userId: req.user!.id, ...req.body });
    return res.status(200).json({ message: "Transfer completed successfully", data: result });
  } catch (error) {
    return next(error);
  }
};
