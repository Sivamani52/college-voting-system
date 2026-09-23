import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import {
  createUser,
  findUserByEmail
} from "../models/userModel.js";
import {
  createAdminRecord,
  findAllAdmins,
  findAdminById,
  findAdminByUserId,
  updateAdminRecord,
  deleteAdminRecord,
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if user already exists
    const existingUser = await findUserByEmail(cleanEmail);
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
    const userId = await createUser(cleanEmail, passwordHash, "ADMIN", true);

    // Create admin profile in admins table
    const adminId = await createAdminRecord({
      userId,
      fullName: cleanName,
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

export async function getAllAdminsController(req, res) {
  try {
    const admins = await findAllAdmins();

    return res.json({
      admins
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    return res.status(500).json({
      message: "Failed to fetch admins"
    });
  }
}

export async function getAdminProfileController(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;

    const admin = await findAdminByUserId(userId);
    if (!admin) {
      if (req.user?.role === "SUPER_ADMIN") {
        return res.json({
          admin: {
            user_id: userId,
            full_name: "Super Admin",
            email: req.user.email,
            role: "SUPER_ADMIN",
            user_status: "ACTIVE"
          }
        });
      }

      return res.status(404).json({
        message: "Admin profile not found"
      });
    }

    return res.json({
      admin
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    return res.status(500).json({
      message: "Failed to fetch admin profile"
    });
  }
}

export async function updateAdminController(req, res) {
  try {
    const { id } = req.params;
    const { name, departmentId, yearId, sectionId } = req.body;

    const admin = await findAdminById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await updateAdminRecord(id, {
      fullName: name || admin.full_name,
      departmentId: departmentId || admin.department_id,
      yearId: yearId !== undefined ? yearId : admin.year_id,
      sectionId: sectionId !== undefined ? sectionId : admin.section_id,
    });

    return res.json({ message: "Admin updated successfully" });
  } catch (error) {
    console.error("Update admin error:", error);
    return res.status(500).json({ message: error.message || "Failed to update admin" });
  }
}

export async function toggleAdminStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Status must be ACTIVE or INACTIVE" });
    }

    const admin = await findAdminById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await pool.query(`UPDATE users SET status = ? WHERE id = ?`, [status, admin.user_id]);

    return res.json({ message: `Admin account marked as ${status}` });
  } catch (error) {
    console.error("Toggle admin status error:", error);
    return res.status(500).json({ message: error.message || "Failed to update admin status" });
  }
}

export async function deleteAdminController(req, res) {
  try {
    const { id } = req.params;
    const admin = await findAdminById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await deleteAdminRecord(id);
    return res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    return res.status(500).json({ message: error.message || "Failed to delete admin" });
  }
}