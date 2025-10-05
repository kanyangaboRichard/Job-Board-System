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
  console.log(" [checkAdmin] req.user received from Passport:", req.user);

  if (req.user && req.user.role === "admin") {
    console.log(" [checkAdmin] Admin access granted");
    return next();
  }

  console.log(" [checkAdmin] Access denied. User or role invalid:", req.user);
  return res.status(403).json({ message: "Forbidden: Admins only" });
}
