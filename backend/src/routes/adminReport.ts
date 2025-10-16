import { Router, Request, Response } from "express";
import passport from "passport";
import pool from "../config/db";
import { checkAdmin } from "../middleware/checkAdmin";

const router = Router();


   //Admin Report — Detailed Applications Table
  //GET /api/admin/monthly-report-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&company=CompanyName
 
router.get(
  "/monthly-report-range",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, company } = req.query;

      //  Default range = current month
      const start = startDate
        ? new Date(startDate as string)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate as string) : new Date();

      const params: any[] = [start, end];
      let companyFilter = "";

      if (company && typeof company === "string" && company.trim() !== "") {
        companyFilter = "AND j.company = $3";
        params.push(company.trim());
      }

      //  Totals for summary cards
      const totalJobsQuery = `
        SELECT COUNT(*) AS count
        FROM jobs j
        WHERE j.created_at BETWEEN $1 AND $2
        ${companyFilter}
      `;

      const applicationsQuery = `
        SELECT
          COUNT(*) AS total_applications,
          SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) AS accepted,
          SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
          SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending
        FROM applications a
        INNER JOIN jobs j ON a.job_id = j.id
        WHERE a.applied_at BETWEEN $1 AND $2
        ${companyFilter}
      `;

      // Detailed Applications Data
      const detailedApplicationsQuery = `
        SELECT 
          j.company,
          u.name AS applicant_name,
          j.title AS job_title,
          a.status,
          a.applied_at
        FROM applications a
        INNER JOIN jobs j ON a.job_id = j.id
        INNER JOIN users u ON a.user_id = u.id
        WHERE a.applied_at BETWEEN $1 AND $2
        ${companyFilter}
        ORDER BY a.applied_at DESC
      `;

      //  Run queries in parallel
      const [jobsRes, appsRes, detailsRes] = await Promise.all([
        pool.query(totalJobsQuery, params),
        pool.query(applicationsQuery, params),
        pool.query(detailedApplicationsQuery, params),
      ]);

      //  Construct report object
      const report = {
        period: `${start.toISOString().split("T")[0]} → ${end.toISOString().split("T")[0]}`,
        totalJobs: Number(jobsRes.rows[0]?.count || 0),
        totalApplications: Number(appsRes.rows[0]?.total_applications || 0),
        accepted: Number(appsRes.rows[0]?.accepted || 0),
        rejected: Number(appsRes.rows[0]?.rejected || 0),
        pending: Number(appsRes.rows[0]?.pending || 0),
        applications: detailsRes.rows || [], //  individual applications
      };

      res.json(report);
    } catch (err) {
      console.error("Error generating admin report:", err);
      res.status(500).json({
        message: "Error generating admin report",
        error: (err as Error).message,
      });
    }
  }
);

  //Get all distinct companies for the Admin dropdown filter
  //GET /api/admin/companies
 
router.get(
  "/companies",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT DISTINCT company 
        FROM jobs 
        WHERE company IS NOT NULL 
        ORDER BY company ASC
      `);
      const companies = result.rows.map((r) => r.company);
      res.json({ companies });
    } catch (err) {
      console.error("Error fetching companies:", err);
      res.status(500).json({ message: "Error fetching companies" });
    }
  }
);

export default router;
