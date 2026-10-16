
import express from "express";
import {
  signup,
  login,
  getMe,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resendResetOTP,
  resetPassword,
  deleteAccount
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/resend-reset-otp", resendResetOTP);
router.post("/reset-password", resetPassword);

router.post("/login", login);
router.get("/me", protect, getMe);
router.delete("/delete-account", protect, deleteAccount);

export default router;
