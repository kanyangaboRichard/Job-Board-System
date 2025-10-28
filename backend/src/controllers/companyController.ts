import { Request, Response } from "express";
import { CompanyService } from "../services/companyServices";

export const CompanyController = {
  async all(_req: Request, res: Response) {
    try {
      const companies = await CompanyService.all();
      res.json(companies);
    } catch (err) {
      console.error("Get companies error:", err);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  },

  async byId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const company = await CompanyService.byId(Number(id));
      res.json(company);
    } catch (err: any) {
      if (err.message === "Company not found") {
        return res.status(404).json({ error: err.message });
      }
      console.error("Get company error:", err);
      res.status(500).json({ error: "Failed to fetch company" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { company_name, company_description, company_location } = req.body;
      if (!company_name || !company_description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const company = await CompanyService.create({
        company_name,
        company_description,
        company_location,
      });

      res.status(201).json(company);
    } catch (err) {
      console.error("Create company error:", err);
      res.status(500).json({ error: "Failed to create company" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await CompanyService.update(Number(id), req.body);
      res.json(updated);
    } catch (err: any) {
      if (err.message === "Company not found") {
        return res.status(404).json({ error: err.message });
      }
      console.error("Update company error:", err);
      res.status(500).json({ error: "Failed to update company" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CompanyService.remove(Number(id));
      res.json({ message: "Company deleted successfully" });
    } catch (err: any) {
      if (err.message === "Company not found") {
        return res.status(404).json({ error: err.message });
      }
      console.error("Delete company error:", err);
      res.status(500).json({ error: "Failed to delete company" });
    }
  },
};
