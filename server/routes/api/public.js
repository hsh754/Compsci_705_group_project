import express from "express";
import {
  listPublicQuestionnaires,
  getQuestionnaireForAnswering
} from "../../controllers/questionnaireController.js";
import {
  submitAnswers,
  submitAnswersWithVideos,
  listSubmissions,
  uploadVideo,
  getSubmissionDetail,
  getSubmissionVideos,
  getSubmissionAnalysis,
  upload
} from "../../controllers/submissionController.js";

const router = express.Router();

// User-side placeholder endpoints - 普通用户可以直接访问，无需登录
router.get("/user/overview", (req, res) => {
  res.json({ completed: 3, pending: 1, lastActiveAt: new Date().toISOString() });
});

// Questionnaire endpoints
router.get("/user/questionnaires", listPublicQuestionnaires);
router.get("/user/questionnaires/:id", getQuestionnaireForAnswering);

// Submission endpoints
router.post("/user/questionnaires/:id/submit", submitAnswers);
router.post("/user/questionnaires/:id/submitWithVideos", upload.array("videos", 20), submitAnswersWithVideos);
router.get("/user/submissions", listSubmissions);
router.get("/user/submissions/:id", getSubmissionDetail);
router.get("/user/submissions/:id/videos", getSubmissionVideos);
router.get("/user/submissions/:id/analysis", getSubmissionAnalysis);

// Video upload
router.post("/user/questionnaires/:id/video", upload.single("video"), uploadVideo);

// Placeholder endpoints
router.get("/user/results", (req, res) => {
  res.json([
    { id: "r1", questionnaireId: "q1", submittedAt: new Date().toISOString(), score: 78 },
    { id: "r2", questionnaireId: "q3", submittedAt: new Date().toISOString(), score: 85 },
  ]);
});

export default router;


