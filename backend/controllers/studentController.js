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
  findAllStudents,
  updateStudentRecord,
  deleteStudentRecord
} from "../models/studentModel.js";

import {
  getAdminScope,
  checkAdminStudentScope
} from "../middleware/adminScopeMiddleware.js";

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
    let {
      studentId,
      fullName,
      email,
      departmentId,
      yearId,
      sectionId,
      phone
    } = req.body;

    // -------------------------
    // 1. Basic validation
    // -------------------------
    if (!studentId || !fullName || !email) {
      return res.status(400).json({
        message: "Student ID, name, and email are required"
      });
    }

    // -------------------------
    // 1b. Enforce ADMIN scope - automatically assign Admin's section
    // -------------------------
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!adminScope || !adminScope.department_id) {
        return res.status(403).json({
          message: "Admin does not have an assigned department. Please contact Super Admin."
        });
      }

      departmentId = adminScope.department_id;
      // If admin has a specific year/section, enforce them. If top admin, use provided yearId/sectionId.
      yearId = adminScope.year_id !== null && adminScope.year_id !== undefined ? adminScope.year_id : yearId;
      sectionId = adminScope.section_id !== null && adminScope.section_id !== undefined ? adminScope.section_id : sectionId;

      if (!yearId || !sectionId) {
        return res.status(400).json({
          message: "Department, Year, and Section are required"
        });
      }
    } else {
      // Super Admin must specify departmentId, yearId, sectionId
      if (!departmentId || !yearId || !sectionId) {
        return res.status(400).json({
          message: "Department, Year, and Section are required"
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
      departmentId: Number(departmentId),
      yearId: Number(yearId),
      sectionId: Number(sectionId),
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

    // Enforce ADMIN scoping strictly to their assigned department + year + section
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!adminScope) {
        return res.status(403).json({
          message: "Admin profile not found"
        });
      }

      departmentId = adminScope.department_id;
      yearId = adminScope.year_id !== null && adminScope.year_id !== undefined ? adminScope.year_id : yearId;
      sectionId = adminScope.section_id !== null && adminScope.section_id !== undefined ? adminScope.section_id : sectionId;
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
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminStudentScope(adminScope, student)) {
        return res.status(403).json({
          message: "You do not have permission to view students outside your assigned section"
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

export async function updateStudentController(req, res) {
  try {
    const { id } = req.params;
    const { fullName, departmentId, yearId, sectionId, phone } = req.body;

    const student = await findStudentById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Scoping for ADMIN
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminStudentScope(adminScope, student)) {
        return res.status(403).json({
          message: "You do not have permission to modify students outside your assigned section"
        });
      }

      if (departmentId && Number(departmentId) !== adminScope.department_id) {
        return res.status(403).json({
          message: "Cannot transfer student outside your assigned department"
        });
      }
      if (yearId && Number(yearId) !== adminScope.year_id) {
        return res.status(403).json({
          message: "Cannot transfer student outside your assigned year"
        });
      }
      if (sectionId && Number(sectionId) !== adminScope.section_id) {
        return res.status(403).json({
          message: "Cannot transfer student outside your assigned section"
        });
      }
    }

    await updateStudentRecord(id, {
      fullName: fullName || student.full_name,
      departmentId: departmentId || student.department_id,
      yearId: yearId !== undefined ? yearId : student.year_id,
      sectionId: sectionId !== undefined ? sectionId : student.section_id,
      phone: phone !== undefined ? phone : student.phone
    });

    const updated = await findStudentById(id);
    return res.json({
      message: "Student updated successfully",
      student: updated
    });
  } catch (error) {
    console.error("Update student error:", error);
    return res.status(500).json({
      message: "Failed to update student"
    });
  }
}

export async function deleteStudentController(req, res) {
  try {
    const { id } = req.params;

    const student = await findStudentById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Scoping for ADMIN
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminStudentScope(adminScope, student)) {
        return res.status(403).json({
          message: "You do not have permission to delete students outside your assigned section"
        });
      }
    }

    await deleteStudentRecord(id);
    return res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(500).json({ message: "Failed to delete student" });
  }
}

export async function toggleStudentStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Valid status (ACTIVE or INACTIVE) is required" });
    }

    const student = await findStudentById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminStudentScope(adminScope, student)) {
        return res.status(403).json({
          message: "You do not have permission to modify student status outside your assigned section"
        });
      }
    }

    await updateStudentRecord(id, { status });
    return res.json({ message: `Student status updated to ${status}` });
  } catch (error) {
    console.error("Toggle student status error:", error);
    return res.status(500).json({ message: "Failed to toggle student status" });
  }
}