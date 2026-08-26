import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail
} from "../models/userModel.js";
import {
  createAdminRecord
} from "../models/adminModel.js";
import {
  generateTemporaryPassword
} from "../utils/passwordGenerator.js";
import {
  sendTemporaryPasswordEmail
} from "../services/emailService.js";
import {
  saveCredentialsToFile
} from "../utils/credentialLogger.js";

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
      !departmentId
    ) {
      return res.status(400).json({
        message: "Name, email, and departmentId are required"
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists"
      });
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Hash password
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Create user in users table
    const userId = await createUser(email, passwordHash, "ADMIN", true);

    // Create admin profile in admins table
    const adminId = await createAdminRecord({
      userId,
      fullName: name,
      departmentId,
      yearId: yearId || null,
      sectionId: sectionId || null
    });

    // Save credentials to file
    await saveCredentialsToFile({
      role: "ADMIN",
      name,
      email,
      password: temporaryPassword,
      extraInfo: {
        userId,
        adminId,
        departmentId,
        yearId: yearId || null,
        sectionId: sectionId || null
      }
    });

    // Send credentials through Brevo
    try {
      await sendTemporaryPasswordEmail(
        email,
        name,
        temporaryPassword
      );
    } catch (emailError) {
      console.error("Warning: Failed to send temporary password email:", emailError.message);
    }

    res.status(201).json({
      message: "Admin created successfully",
      userId,
      adminId,
      temporaryPassword
    });

  } catch (error) {
    console.error("Create admin error:", error);

    res.status(500).json({
      message: error.message || "Failed to create admin"
    });
  }
}