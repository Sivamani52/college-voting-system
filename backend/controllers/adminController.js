import bcrypt from "bcryptjs";

import {
  createUser,
  findUserByEmail,
  updateMustChangePassword
} from "../models/userModel.js";

import {
  createAdmin
} from "../models/adminModel.js";

import {
  generateTemporaryPassword
} from "../utils/passwordGenerator.js";

import {
  sendTemporaryPasswordEmail
} from "../services/emailService.js";

export async function createAdmin(req, res) {
  try {
    const {
      name,
      email,
      departmentId,
      yearId,
      sectionId
    } = req.body;

    // Validation
    if (
      !name ||
      !email ||
      !departmentId ||
      !yearId ||
      !sectionId
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Generate temporary password
    const temporaryPassword =
      generateTemporaryPassword();

    // Hash password
    const passwordHash =
      await bcrypt.hash(temporaryPassword, 10);

    // Create admin
    const userId =
      await adminModel.createAdminUser({
        email,
        passwordHash,
        name,
        departmentId,
        yearId,
        sectionId
      });

    // Send credentials through Brevo
    await sendTemporaryPasswordEmail(
      email,
      name,
      temporaryPassword
    );

    res.status(201).json({
      message: "Admin created successfully",
      userId
    });

  } catch (error) {
    console.error("Create admin error:", error);

    res.status(500).json({
      message: "Failed to create admin"
    });
  }
}