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

//  Middleware for admin-only routes
export function checkAdmin(req: Request, res: Response, next: NextFunction) {
  // Only log in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("[checkAdmin] User attempting access:", req.user);
  }

  if (req.user && req.user.role === "admin") {
    return next();
  }

  // Log denied access in development only
  if (process.env.NODE_ENV === "development") {
    console.warn("[checkAdmin] Access denied:", req.user);
  }

  return res.status(403).json({ message: "Forbidden: Admins only" });
}
