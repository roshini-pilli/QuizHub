import express from "express";
import {
  signup,
  login,
  getMe,
  verifyOTP,
  resendOTP,
  deleteAccount
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.get("/me", protect, getMe);
router.delete("/delete-account", protect, deleteAccount);

export default router;