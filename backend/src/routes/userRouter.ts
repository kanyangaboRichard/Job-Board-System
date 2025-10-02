import { Router, Request, Response } from "express";
import pool from "../config/db";     
import passport from "passport";
import { checkAdmin } from "../middleware/checkAdmin";

const router = Router();

//  GET /api/users (list all users - admin only)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const result = await pool.query("SELECT id, email, role FROM users");
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PATCH /api/users/:id/make-admin
router.patch(
  "/:id/make-admin",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "UPDATE users SET role = 'admin' WHERE id = $1 RETURNING id, email, role",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error promoting user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PATCH /api/users/:id/revoke-admin
router.patch(
  "/:id/revoke-admin",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      //  Prevent an admin from revoking their own role
      if (req.user && String(req.user.id) === id) {
        return res.status(400).json({ message: "You cannot revoke your own admin rights." });
      }

      const result = await pool.query(
        "UPDATE users SET role = 'user' WHERE id = $1 RETURNING id, email, role",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error revoking admin:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
