import type { NextFunction, Request, Response } from "express";
import { findUserById } from "../modules/users/user.service";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid authorization header" });
    }

    const userId = header.replace("Bearer ", "").trim();

    if (!userId) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid auth token" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
