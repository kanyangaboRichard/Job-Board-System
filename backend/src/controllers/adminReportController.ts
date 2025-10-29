import { Request, Response } from "express";
import { adminReportService } from "../services/adminReportService";

export const AdminReportController = {
  // Generate full report
  async generate(req: Request, res: Response) {
    try {
      const { startDate, endDate, company } = req.query;

      const report = await adminReportService.generate(
        startDate as string,
        endDate as string,
        company as string
      );

      res.status(200).json(report);
    } catch (err) {
      console.error("Error generating admin report:", err);
      res.status(500).json({
        message: "Error generating admin report",
        error: (err as Error).message,
      });
    }
  },

  // List companies
  async listCompanies(_req: Request, res: Response) {
    try {
      const companies = await adminReportService.getCompanies();
      res.status(200).json({ companies });
    } catch (err) {
      console.error(" Error fetching companies:", err);
      res.status(500).json({
        message: "Error fetching companies",
        error: (err as Error).message,
      });
    }
  },
};
