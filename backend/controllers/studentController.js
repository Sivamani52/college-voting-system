import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../models/userModel.js";
import { createStudentRecord, findStudentByStudentId } from "../models/studentModel.js";
import { generateTemporaryPassword } from "../utils/passwordGenerator.js";
import { sendTemporaryPasswordEmail } from "../services/emailService.js";
import { saveCredentialsToFile } from "../utils/credentialLogger.js";

export async function createStudent(req, res) {
  try {
    const {
      studentId,
      fullName,
      email,
      departmentId,
      yearId,
      sectionId,
      phone,
      password
    } = req.body;

    // Validation
    if (!studentId || !fullName || !email || !departmentId || !yearId || !sectionId) {
      return res.status(400).json({
        message: "studentId, fullName, email, departmentId, yearId, and sectionId are required"
      });
    }

    // Check if user with email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists"
      });
    }

    // Check if studentId already exists
    const existingStudent = await findStudentByStudentId(studentId);
    if (existingStudent) {
      return res.status(400).json({
        message: "A student with this Student ID already exists"
      });
    }

    // Password generation: use provided password or auto-generate temporary password
    const studentPassword = password || generateTemporaryPassword();
    const mustChangePassword = !password; // If generated, must change on first login

    // Hash password
    const passwordHash = await bcrypt.hash(studentPassword, 10);

    // Create user in users table
    const userId = await createUser(email, passwordHash, "STUDENT", mustChangePassword);

    // Create student profile in students table
    const studentTableId = await createStudentRecord({
      userId,
      studentId,
      fullName,
      departmentId,
      yearId,
      sectionId,
      phone: phone || null
    });

    // Save credentials to file
    await saveCredentialsToFile({
      role: "STUDENT",
      name: fullName,
      studentId,
      email,
      password: studentPassword,
      extraInfo: {
        userId,
        studentTableId,
        departmentId,
        yearId,
        sectionId,
        phone: phone || null
      }
    });

    // Send credentials through Brevo email if possible
    try {
      await sendTemporaryPasswordEmail(email, fullName, studentPassword);
    } catch (emailError) {
      console.error("Warning: Failed to send student credentials email:", emailError.message);
    }

    res.status(201).json({
      message: "Student created successfully",
      userId,
      studentTableId,
      studentId,
      temporaryPassword: studentPassword
    });

  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({
      message: error.message || "Failed to create student"
    });
  }
}
