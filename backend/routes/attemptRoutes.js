import express from "express";

import {
  startAttempt,
  submitAttempt,
  getAttemptResult,
  getLeaderboard,
  getMyAttempts,
  getQuizAnalytics,
  getAIExplanation
} from "../controllers/attemptController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startAttempt);

router.post("/submit", protect, submitAttempt);

router.get("/leaderboard/:quizId", protect, getLeaderboard);

router.get("/history", protect, getMyAttempts);

router.get("/analytics/:quizId", protect, getQuizAnalytics);

router.post("/:attemptId/explanation", protect, getAIExplanation);

router.get("/:attemptId", protect, getAttemptResult);

export default router;