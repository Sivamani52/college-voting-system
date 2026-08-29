import bcrypt from "bcryptjs";

import {
  createUser,
  findUserByEmail
} from "../models/userModel.js";

import {
  createStudentRecord,
  findStudentByStudentId,
  findStudentById,
  findStudentByUserId,
  findAllStudents
} from "../models/studentModel.js";

import {
  findAdminByUserId
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
    // 1b. Enforce ADMIN scope
    // -------------------------
    if (req.user?.role === "ADMIN") {
      const admin = await findAdminByUserId(req.user.userId || req.user.id);
      if (!admin) {
        return res.status(403).json({
          message: "Admin profile not found"
        });
      }

      if (admin.department_id !== Number(departmentId)) {
        return res.status(403).json({
          message: "Admins can only create students in their assigned department"
        });
      }

      if (admin.year_id && admin.year_id !== Number(yearId)) {
        return res.status(403).json({
          message: "Admins can only create students in their assigned year"
        });
      }

      if (admin.section_id && admin.section_id !== Number(sectionId)) {
        return res.status(403).json({
          message: "Admins can only create students in their assigned section"
        });
      }
    }

    // -------------------------
    // 2. Check email uniqueness
    // -------------------------
    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = studentId.trim();

    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists"
      });
    }

    // -------------------------
    // 3. Check student ID uniqueness
    // -------------------------
    const existingStudent = await findStudentByStudentId(cleanStudentId);
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
    const userId = await createUser(cleanEmail, passwordHash, "STUDENT", true);

    // -------------------------
    // 7. Create student profile
    // -------------------------
    const studentRecordId = await createStudentRecord({
      userId,
      studentId: cleanStudentId,
      fullName: fullName.trim(),
      departmentId: Number(departmentId),
      yearId: Number(yearId),
      sectionId: Number(sectionId),
      phone: phone ? phone.trim() : null
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
        departmentId: Number(departmentId),
        yearId: Number(yearId),
        sectionId: Number(sectionId),
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

export async function getAllStudentsController(req, res) {
  try {
    let { departmentId, yearId, sectionId, status } = req.query;

    // Enforce ADMIN scoping to their assigned department/year/section
    if (req.user?.role === "ADMIN") {
      const admin = await findAdminByUserId(req.user.userId || req.user.id);
      if (admin) {
        departmentId = admin.department_id;
        if (admin.year_id) yearId = admin.year_id;
        if (admin.section_id) sectionId = admin.section_id;
      }
    }

    const students = await findAllStudents({
      departmentId: departmentId ? Number(departmentId) : undefined,
      yearId: yearId ? Number(yearId) : undefined,
      sectionId: sectionId ? Number(sectionId) : undefined,
      status
    });

    return res.json({
      students
    });

  } catch (error) {
    console.error("Get all students error:", error);
    return res.status(500).json({
      message: "Failed to fetch students"
    });
  }
}

export async function getStudentByIdController(req, res) {
  try {
    const { id } = req.params;

    const student = await findStudentById(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Enforce ADMIN scoping
    if (req.user?.role === "ADMIN") {
      const admin = await findAdminByUserId(req.user.userId || req.user.id);
      if (
        admin &&
        (student.department_id !== admin.department_id ||
          (admin.year_id && student.year_id !== admin.year_id) ||
          (admin.section_id && student.section_id !== admin.section_id))
      ) {
        return res.status(403).json({
          message: "You do not have permission to view students outside your assigned department"
        });
      }
    }

    return res.json({
      student
    });

  } catch (error) {
    console.error("Get student by ID error:", error);
    return res.status(500).json({
      message: "Failed to fetch student"
    });
  }
}

export async function getStudentProfileController(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;

    const student = await findStudentByUserId(userId);

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found"
      });
    }

    return res.json({
      student
    });

  } catch (error) {
    console.error("Get student profile error:", error);
    return res.status(500).json({
      message: "Failed to fetch student profile"
    });
  }
}