import {
  findAllDepartmentsWithStats,
  findDepartmentById,
  findDepartmentByNameOrCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../models/departmentModel.js";
import { findYearsByDepartment } from "../models/academicStructureModel.js";
import pool from "../config/db.js";

export async function getAllDepartmentsController(req, res) {
  try {
    const departments = await findAllDepartmentsWithStats();
    return res.json({ departments });
  } catch (error) {
    console.error("Get departments error:", error);
    return res.status(500).json({ message: "Failed to fetch departments" });
  }
}

export async function getDepartmentByIdController(req, res) {
  try {
    const { id } = req.params;
    const department = await findDepartmentById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const years = await findYearsByDepartment(id);
    const [admins] = await pool.query(
      `SELECT a.*, u.email, u.status AS user_status
       FROM admins a
       JOIN users u ON a.user_id = u.id
       WHERE a.department_id = ?`,
      [id]
    );

    return res.json({
      department: {
        ...department,
        years,
        admins,
      },
    });
  } catch (error) {
    console.error("Get department details error:", error);
    return res.status(500).json({ message: "Failed to fetch department details" });
  }
}

export async function createDepartmentController(req, res) {
  try {
    const { name, code, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Department name and code are required",
      });
    }

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    // Check duplicate
    const existing = await findDepartmentByNameOrCode(cleanName, cleanCode);
    if (existing) {
      if (existing.name.toLowerCase() === cleanName.toLowerCase()) {
        return res.status(400).json({ message: "A department with this name already exists" });
      }
      if (existing.code.toUpperCase() === cleanCode.toUpperCase()) {
        return res.status(400).json({ message: "A department with this code already exists" });
      }
    }

    const departmentId = await createDepartment({
      name: cleanName,
      code: cleanCode,
      status: status || "ACTIVE",
    });

    return res.status(201).json({
      message: "Department created successfully",
      departmentId,
    });
  } catch (error) {
    console.error("Create department error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create department",
    });
  }
}

export async function updateDepartmentController(req, res) {
  try {
    const { id } = req.params;
    const { name, code, status } = req.body;

    const department = await findDepartmentById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (name || code) {
      const cleanName = name ? name.trim() : department.name;
      const cleanCode = code ? code.trim().toUpperCase() : department.code;
      const existing = await findDepartmentByNameOrCode(cleanName, cleanCode, id);
      if (existing) {
        if (name && existing.name.toLowerCase() === cleanName.toLowerCase()) {
          return res.status(400).json({ message: "A department with this name already exists" });
        }
        if (code && existing.code.toUpperCase() === cleanCode.toUpperCase()) {
          return res.status(400).json({ message: "A department with this code already exists" });
        }
      }
    }

    await updateDepartment(id, { name, code, status });

    return res.json({
      message: "Department updated successfully",
    });
  } catch (error) {
    console.error("Update department error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update department",
    });
  }
}

export async function deleteDepartmentController(req, res) {
  try {
    const { id } = req.params;

    const department = await findDepartmentById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if there are active students or elections tied
    const [students] = await pool.query(
      `SELECT COUNT(*) AS count FROM students WHERE department_id = ?`,
      [id]
    );

    if (students[0]?.count > 0) {
      return res.status(400).json({
        message: `Cannot delete department with ${students[0].count} enrolled students. Deactivate it instead.`,
      });
    }

    await deleteDepartment(id);

    return res.json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    return res.status(500).json({
      message: error.message || "Failed to delete department",
    });
  }
}
