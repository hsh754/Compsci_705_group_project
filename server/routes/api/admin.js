import express from "express";
import { protect, requireRole } from "../../middleware/auth.js";

const router = express.Router();

// Admin overview (placeholder data)
router.get("/overview", protect, requireRole("admin"), (req, res) => {
  res.json({
    usersTotal: 128,
    questionnairesTotal: 12,
    submissionsTotal: 934,
    trends: [],
  });
});

// Questionnaire management list (placeholder)
router.get("/questionnaires", protect, requireRole("admin"), (req, res) => {
  res.json([
    { id: "q1", title: "Customer Satisfaction", version: "1.0" },
    { id: "q2", title: "Employee Engagement", version: "2.1" },
  ]);
});

// Reports (placeholder)
router.get("/reports", protect, requireRole("admin"), (req, res) => {
  res.json({ trend: [], groupCompare: [] });
});

// System settings get/update (placeholder)
router
  .route("/settings")
  .get(protect, requireRole("admin"), (req, res) => {
    res.json({ evalThreshold: 0.7, permissions: { create: true, delete: false } });
  })
  .put(protect, requireRole("admin"), (req, res) => {
    res.json({ success: true });
  });

export default router;


