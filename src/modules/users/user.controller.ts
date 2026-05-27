import type { Request, Response, NextFunction } from "express";
import { createUser, getProfile } from "./user.service";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createUser(req.body);
    return res.status(201).json({
      message: "User and wallet created successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await getProfile(req.user!.id);
    return res.status(200).json({ data: profile });
  } catch (error) {
    return next(error);
  }
};
