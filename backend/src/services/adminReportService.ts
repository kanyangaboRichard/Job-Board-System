// src/services/adminReportService.ts
import pool from "../config/db";

export const adminReportService = {
  
  // Generate report
  
  async generate(startDate: string, endDate: string, company?: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const params: any[] = [start, end];
    let companyFilter = "";

    if (company && company.trim()) {
      companyFilter = "AND c.company_name = $3";
      params.push(company.trim());
    }

    //  JOIN companies c ON j.company_id = c.company_id

    const totalJobsQuery = `
      SELECT COUNT(*) AS count
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.company_id
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
      LEFT JOIN companies c ON j.company_id = c.company_id
      WHERE a.applied_at BETWEEN $1 AND $2
      ${companyFilter}
    `;

    const detailedApplicationsQuery = `
      SELECT 
        c.company_name AS company,
        u.name AS applicant_name,
        j.title AS job_title,
        a.status,
        a.applied_at
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.company_id
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.applied_at BETWEEN $1 AND $2
      ${companyFilter}
      ORDER BY a.applied_at DESC
    `;

    const [jobsRes, appsRes, detailsRes] = await Promise.all([
      pool.query(totalJobsQuery, params),
      pool.query(applicationsQuery, params),
      pool.query(detailedApplicationsQuery, params),
    ]);

    return {
      period: `${start.toISOString().split("T")[0]} → ${end.toISOString().split("T")[0]}`,
      totalJobs: Number(jobsRes.rows[0]?.count || 0),
      totalApplications: Number(appsRes.rows[0]?.total_applications || 0),
      accepted: Number(appsRes.rows[0]?.accepted || 0),
      rejected: Number(appsRes.rows[0]?.rejected || 0),
      pending: Number(appsRes.rows[0]?.pending || 0),
      applications: detailsRes.rows || [],
    };
  },


  // List distinct companies
  
  async getCompanies() {
    const query = `
      SELECT DISTINCT c.company_name
      FROM companies c
      JOIN jobs j ON j.company_id = c.company_id
      WHERE c.company_name IS NOT NULL
      ORDER BY c.company_name ASC
    `;

    const result = await pool.query(query);
    return result.rows.map((r) => r.company_name);
  },
};
