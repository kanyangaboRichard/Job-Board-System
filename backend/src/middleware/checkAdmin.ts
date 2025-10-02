import { Request, Response, NextFunction } from "express";

// Extend Express Request type so TypeScript knows about req.user
declare global {
  namespace Express {
    interface User {
      id: number;
      email?: string;
      role?: string;
    }
    interface Request {
      user?: User;
    }
  }
}

export function checkAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.role === "admin") {
    return next(); // ✅ allow
  }
  return res.status(403).json({ message: "Forbidden: Admins only" });
}
