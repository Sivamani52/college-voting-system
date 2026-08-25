import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


import {
  findUserByEmail,
  createUser
} from "../models/userModel.js";



export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Account is inactive"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }


    if (user.must_change_password) {
      return res.json({
        message: "Password change required",
        requiresPasswordChange: true,
        userId: user.id,
        role: user.role
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await userModel.findUserByEmail(email);

    // Email was never created by Admin/Super Admin
    if (!user) {
      return res.status(404).json({
        message: "This email is not registered in the college voting system"
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "This account is inactive"
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // OTP valid for 5 minutes
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Invalidate previous forgot-password OTPs
    await pool.query(
      `UPDATE otp_verifications
       SET verified = TRUE
       WHERE user_id = ?
       AND purpose = 'FORGOT_PASSWORD'
       AND verified = FALSE`,
      [user.id]
    );

    // Save new OTP
    await pool.query(
      `INSERT INTO otp_verifications
       (user_id, otp_code, purpose, expires_at)
       VALUES (?, ?, 'FORGOT_PASSWORD', ?)`,
      [user.id, otp, expiresAt]
    );

    // Send OTP using Brevo
    await sendOTPEmail(email, otp);

    res.json({
      message: "OTP sent to your registered email",
      requiresOTP: true
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Failed to process forgot password request"
    });
  }
}


export async function verifyForgotPasswordOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const [rows] = await pool.query(
      `SELECT *
       FROM otp_verifications
       WHERE user_id = ?
       AND purpose = 'FORGOT_PASSWORD'
       AND verified = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    const otpRecord = rows[0];

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found or already used"
      });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({
        message: "OTP has expired"
      });
    }

    if (otpRecord.otp_code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // Mark OTP as verified
    await pool.query(
      `UPDATE otp_verifications
       SET verified = TRUE
       WHERE id = ?`,
      [otpRecord.id]
    );

    res.json({
      message: "OTP verified successfully",
      resetAllowed: true,
      userId: user.id
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      message: "Failed to verify OTP"
    });
  }
}


export async function resetPassword(req, res) {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        message: "User ID and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.query(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [passwordHash, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Failed to reset password"
    });
  }
}


export async function changePassword(req, res) {
  try {
    const {
      userId,
      currentPassword,
      newPassword
    } = req.body;

    if (
      !userId ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password_hash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    const newPasswordHash =
      await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password_hash = ?,
           must_change_password = FALSE
       WHERE id = ?`,
      [
        newPasswordHash,
        userId
      ]
    );

    res.json({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    res.status(500).json({
      message: "Failed to change password"
    });
  }
}