import express from "express";
import { protect, requireRole } from "../../middleware/auth.js";
import multer from "multer";
import {
  listQuestionnaires,
  uploadQuestionnaire,
  getQuestionnaireDetail,
  updateQuestionnaire,
  deleteQuestionnaire
} from "../../controllers/questionnaireController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Admin overview (placeholder data)
router.get("/overview", protect, requireRole("admin"), (req, res) => {
  res.json({
    usersTotal: 128,
    questionnairesTotal: 12,
    submissionsTotal: 934,
    trends: [],
  });
});

// Questionnaire management
router.get("/questionnaires", protect, requireRole("admin"), listQuestionnaires);
router.post("/questionnaires/upload", protect, requireRole("admin"), upload.single("file"), uploadQuestionnaire);
router.get("/questionnaires/:id", protect, requireRole("admin"), getQuestionnaireDetail);
router.patch("/questionnaires/:id", protect, requireRole("admin"), updateQuestionnaire);
router.delete("/questionnaires/:id", protect, requireRole("admin"), deleteQuestionnaire);

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


