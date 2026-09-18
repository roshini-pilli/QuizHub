import express from "express";
import {
  createQuiz,
  joinQuiz,
  getQuiz,
  getMyQuizzes,
  deleteQuiz,
  updateQuiz,
  getMyQuiz
} from "../controllers/quizController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createQuiz);
router.post("/join", protect, joinQuiz);
router.get("/mine", protect, getMyQuizzes);
router.get("/mine/:quizId", protect, getMyQuiz);
router.get("/:quizId", protect, getQuiz);
router.put("/:quizId", protect, updateQuiz);
router.delete("/:quizId", protect, deleteQuiz);

export default router;