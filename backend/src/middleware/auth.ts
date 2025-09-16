import passport from "../config/passport";
import { Response, NextFunction } from "express";

// Require authentication with JWT
export const requireAuth = passport.authenticate("jwt", { session: false });

// Require a specific role
export const requireRole = (role: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }

    next();
  };
};
