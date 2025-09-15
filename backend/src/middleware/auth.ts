import passport from "../config/passport";
import { Request, Response, NextFunction } from "express";

export const requireAuth = passport.authenticate("jwt", { session: false });

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { id: number; role: string };
    if (!user || user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
