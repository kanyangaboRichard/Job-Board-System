import { RequestHandler } from "express";
import * as applicationService from "../services/applicationServices";

export const getUserApplications: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const applications = await applicationService.getUserApplicationsService(req.user.id);
    return res.json(applications);
  } catch (err) {
    console.error("Get user applications error:", err);
    return res.status(500).json({ error: "Failed to fetch user applications" });
  }
};
import "express";

declare global {
  namespace Express {
    interface User {
      id: number;
      email?: string;
      role?: string;
    }
  }
}

