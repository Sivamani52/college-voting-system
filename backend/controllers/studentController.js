import bcrypt from "bcryptjs";

import {
  createUser,
  findUserByEmail
} from "../models/userModel.js";

import {
  createStudentRecord,
  findStudentByStudentId
} from "../models/studentModel.js";

import {
  generateTemporaryPassword
} from "../utils/passwordGenerator.js";

import {
  sendTemporaryPasswordEmail
} from "../services/emailService.js";

import {
  saveCredentialsToFile
} from "../utils/credentialLogger.js";

export async function createStudent(req, res) {
  try {
    const {
      studentId,
      fullName,
      email,
      departmentId,
      yearId,
      sectionId,
      phone
    } = req.body;

    // -------------------------
    // 1. Validate input
    // -------------------------
    if (
      !studentId ||
      !fullName ||
      !email ||
      !departmentId ||
      !yearId ||
      !sectionId
    ) {
      return res.status(400).json({
        message: "Student ID, name, email, departmentId, yearId and sectionId are required"
      });
    }

    // -------------------------
    // 2. Check email uniqueness
    // -------------------------
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists"
      });
    }

    // -------------------------
    // 3. Check student ID uniqueness
    // -------------------------
    const existingStudent = await findStudentByStudentId(studentId);
    if (existingStudent) {
      return res.status(409).json({
        message: "A student with this Student ID already exists"
      });
    }

    // -------------------------
    // 4. Generate temporary password
    // -------------------------
    const temporaryPassword = generateTemporaryPassword();

    // -------------------------
    // 5. Hash password
    // -------------------------
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // -------------------------
    // 6. Create user (with mustChangePassword = true)
    // -------------------------
    const userId = await createUser(email, passwordHash, "STUDENT", true);

    // -------------------------
    // 7. Create student profile
    // -------------------------
    const studentRecordId = await createStudentRecord({
      userId,
      studentId,
      fullName,
      departmentId,
      yearId,
      sectionId,
      phone: phone || null
    });

    // -------------------------
    // 8. Save credentials to credentials.txt file
    // -------------------------
    await saveCredentialsToFile({
      role: "STUDENT",
      name: fullName,
      studentId,
      email,
      password: temporaryPassword,
      extraInfo: {
        userId,
        studentRecordId,
        departmentId,
        yearId,
        sectionId,
        phone: phone || null
      }
    });

    // -------------------------
    // 9. Send credentials via email (fail-safe)
    // -------------------------
    try {
      await sendTemporaryPasswordEmail(
        email,
        fullName,
        temporaryPassword
      );
    } catch (emailError) {
      console.error("Warning: Failed to send temporary password email to student:", emailError.message);
    }

    return res.status(201).json({
      message: "Student created successfully",
      userId,
      studentRecordId,
      studentId,
      temporaryPassword
    });

  } catch (error) {
    console.error("Create student error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create student"
    });
  }
}