
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

const generateToken = userId => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const normalizeEmail = email =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const resetEmailMessage =
  "If an eligible account exists for this email, instructions will be sent.";

export const signup = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!name || !email || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({
        message: "An account with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
    }

    await user.save();

    await sendEmail(
      email,
      "QuizHub Email Verification",
      `Your QuizHub verification code is ${otp}. This code will expire in 10 minutes.`
    );

    return res.status(201).json({
      message: "OTP sent to your email",
      email
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to complete signup"
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = typeof req.body.otp === "string" ? req.body.otp : "";

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "No active OTP found"
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    const token = generateToken(user._id);

    return res.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to verify OTP"
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendEmail(
      email,
      "QuizHub Email Verification",
      `Your new QuizHub verification code is ${otp}. This code will expire in 10 minutes.`
    );

    return res.json({
      message: "A new OTP has been sent to your email"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to resend OTP"
    });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Wrong password"
      });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to log in"
    });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address."
      });
    }

    const user = await User.findOne({ email, isVerified: true });

    if (!user) {
      return res.status(404).json({
        message: "Account doesn't exist. Please check your email or sign up."
      });
    }

    const otp = generateOTP();

    user.resetOtp = otp;
    user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;

    await user.save();

    try {
      await sendEmail(
        email,
        "QuizHub Password Reset OTP",
        `Your QuizHub password reset OTP is ${otp}. It expires in 10 minutes.`
      );
    } catch (emailError) {
      user.resetOtp = null;
      user.resetOtpExpiresAt = null;
      await user.save();

      return res.status(500).json({
        message: "Unable to send OTP. Please try again."
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully to your registered email."
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again."
    });
  }
};


export const verifyResetOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = typeof req.body.otp === "string" ? req.body.otp : "";

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    const user = await User.findOne({
      email,
      isVerified: true
    });

    if (
      !user ||
      !user.resetOtp ||
      !user.resetOtpExpiresAt
    ) {
      return res.status(400).json({
        message: "Invalid or expired reset code"
      });
    }

    if (user.resetOtpExpiresAt < new Date()) {
      user.resetOtp = null;
      user.resetOtpExpiresAt = null;
      await user.save();

      return res.status(400).json({
        message: "Invalid or expired reset code"
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid or expired reset code"
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    user.resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    return res.json({
      message: "OTP verified successfully",
      resetToken
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to verify reset code"
    });
  }
};

export const resendResetOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({
      email,
      isVerified: true
    });

    if (user) {
      const otp = generateOTP();

      user.resetOtp = otp;
      user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      user.resetTokenHash = null;
      user.resetTokenExpiresAt = null;

      await user.save();

      try {
        await sendEmail(
          email,
          "QuizHub Password Reset",
          `Your new QuizHub password reset code is ${otp}. This code expires in 10 minutes.`
        );
      } catch (emailError) {
        user.resetOtp = null;
        user.resetOtpExpiresAt = null;
        await user.save();
        throw emailError;
      }
    }

    return res.json({
      message: resetEmailMessage
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to process your request"
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetToken =
      typeof req.body.resetToken === "string" ? req.body.resetToken : "";
    const password = req.body.password;

    if (!resetToken || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Reset token and new password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetTokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
      isVerified: true
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset session is invalid or expired. Please start again."
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;

    await user.save();

    return res.json({
      message: "Password reset successfully. Please log in with your new password."
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to reset password"
    });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    user: req.user
  });
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await Quiz.deleteMany({
      creator: userId
    });

    await QuizAttempt.deleteMany({
      user: userId
    });

    await User.findByIdAndDelete(userId);

    return res.json({
      message: "Account and associated data deleted successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to delete account"
    });
  }
};
