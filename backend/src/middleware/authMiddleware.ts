import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || typeof JWT_SECRET !== "string") {
  throw new Error("JWT_SECRET is not defined");
}

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}


  //Middleware: Authenticate user
 
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.id !== "number" ||
      typeof decoded.role !== "string"
    ) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};


  //Middleware: Role-based access
 
export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }
    next();
  };
};
