import pool from "../config/db";
import { CompanyAttributes } from "../models/companyModel";

export const CompanyService = {
  // Get all companies
  async all(): Promise<CompanyAttributes[]> {
    const result = await pool.query<CompanyAttributes>(
      `SELECT company_id, company_name, company_description, company_location
       FROM companies
       ORDER BY company_id DESC`
    );
    return result.rows;
  },

  //  Get company by ID
  async byId(id: number): Promise<CompanyAttributes> {
    const result = await pool.query<CompanyAttributes>(
      `SELECT company_id, company_name, company_description, company_location
       FROM companies
       WHERE company_id = $1`,
      [id]
    );

    if (result.rows.length === 0) throw new Error("Company not found");
    return result.rows[0]!;
  },

  //  Create a new company
  async create(
    company: Omit<CompanyAttributes, "company_id">
  ): Promise<CompanyAttributes> {
    const result = await pool.query<CompanyAttributes>(
      `INSERT INTO companies (company_name, company_description, company_location)
       VALUES ($1, $2, $3)
       RETURNING company_id, company_name, company_description, company_location`,
      [company.company_name, company.company_description, company.company_location || null]
    );

    if (result.rows.length === 0) throw new Error("Failed to create company");
    return result.rows[0]!;
  },

  // Update a company
  async update(
    id: number,
    fields: Partial<CompanyAttributes>
  ): Promise<CompanyAttributes> {
    const result = await pool.query<CompanyAttributes>(
      `UPDATE companies
       SET company_name = COALESCE($1, company_name),
           company_description = COALESCE($2, company_description),
           company_location = COALESCE($3, company_location)
       WHERE company_id = $4
       RETURNING company_id, company_name, company_description, company_location`,
      [
        fields.company_name ?? null,
        fields.company_description ?? null,
        fields.company_location ?? null,
        id,
      ]
    );

    if (result.rows.length === 0) throw new Error("Company not found");
    return result.rows[0]!;
  },

  //  Delete company
  async remove(id: number): Promise<void> {
    const result = await pool.query(
      `DELETE FROM companies WHERE company_id = $1 RETURNING company_id`,
      [id]
    );
    if (result.rowCount === 0) throw new Error("Company not found");
  },
};
