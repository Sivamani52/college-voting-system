import express from "express";

import {
  login,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword
} from "../controllers/authController.js";

import { optionalAuthenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Normal login
router.post("/login", login);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Verify forgot-password OTP
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTP);

// Set new password
router.post("/reset-password", resetPassword);

router.post(
  "/change-password",
  optionalAuthenticateToken,
  changePassword
);

export default router;