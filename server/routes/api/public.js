import express from "express";
import { protect } from "../../middleware/auth.js";

const router = express.Router();

// User-side placeholder endpoints
router.get("/user/overview", protect, (req, res) => {
  res.json({ completed: 3, pending: 1, lastActiveAt: new Date().toISOString() });
});

router.get("/user/questionnaires", protect, (req, res) => {
  res.json([
    { id: "q1", title: "Emotion Recognition Assessment", version: "1.0", items: 10 },
    { id: "q3", title: "Attention Test", version: "0.9", items: 8 },
  ]);
});

router.get("/user/results", protect, (req, res) => {
  res.json([
    { id: "r1", questionnaireId: "q1", submittedAt: new Date().toISOString(), score: 78 },
    { id: "r2", questionnaireId: "q3", submittedAt: new Date().toISOString(), score: 85 },
  ]);
});

export default router;


