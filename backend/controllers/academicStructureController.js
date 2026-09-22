import {
  findYearsByDepartment,
  findYearById,
  findYearByDepartmentAndName,
  createYear,
  updateYear,
  deleteYear,
  findSectionsByYear,
  findSectionById,
  findSectionByYearAndName,
  createSection,
  updateSection,
  deleteSection,
  getFullAcademicStructureTree,
} from "../models/academicStructureModel.js";
import pool from "../config/db.js";

// --- Academic Structure Tree ---

export async function getAcademicStructureController(req, res) {
  try {
    const tree = await getFullAcademicStructureTree();
    return res.json({ structure: tree });
  } catch (error) {
    console.error("Get academic structure tree error:", error);
    return res.status(500).json({ message: "Failed to fetch academic structure" });
  }
}

// --- Year Controllers ---

export async function getYearsController(req, res) {
  try {
    const departmentId = req.query.departmentId || req.params.departmentId || null;
    const years = await findYearsByDepartment(departmentId);
    return res.json({ years });
  } catch (error) {
    console.error("Get years error:", error);
    return res.status(500).json({ message: "Failed to fetch academic years" });
  }
}

export async function createYearController(req, res) {
  try {
    const { departmentId, name } = req.body;

    if (!departmentId || !name) {
      return res.status(400).json({ message: "Department ID and Year name are required" });
    }

    const cleanName = name.trim();
    const existing = await findYearByDepartmentAndName(departmentId, cleanName);
    if (existing) {
      return res.status(400).json({
        message: `Year "${cleanName}" already exists for this department`,
      });
    }

    const yearId = await createYear({ departmentId, name: cleanName });
    return res.status(201).json({
      message: "Academic year created successfully",
      yearId,
    });
  } catch (error) {
    console.error("Create year error:", error);
    return res.status(500).json({ message: error.message || "Failed to create academic year" });
  }
}

export async function updateYearController(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Year name is required" });
    }

    const year = await findYearById(id);
    if (!year) {
      return res.status(404).json({ message: "Academic year not found" });
    }

    const cleanName = name.trim();
    const existing = await findYearByDepartmentAndName(year.department_id, cleanName, id);
    if (existing) {
      return res.status(400).json({
        message: `Year "${cleanName}" already exists for this department`,
      });
    }

    await updateYear(id, { name: cleanName });
    return res.json({ message: "Academic year updated successfully" });
  } catch (error) {
    console.error("Update year error:", error);
    return res.status(500).json({ message: error.message || "Failed to update academic year" });
  }
}

export async function deleteYearController(req, res) {
  try {
    const { id } = req.params;
    const year = await findYearById(id);
    if (!year) {
      return res.status(404).json({ message: "Academic year not found" });
    }

    const [students] = await pool.query(
      `SELECT COUNT(*) AS count FROM students WHERE year_id = ?`,
      [id]
    );

    if (students[0]?.count > 0) {
      return res.status(400).json({
        message: `Cannot delete year with ${students[0].count} enrolled students.`,
      });
    }

    await deleteYear(id);
    return res.json({ message: "Academic year deleted successfully" });
  } catch (error) {
    console.error("Delete year error:", error);
    return res.status(500).json({ message: error.message || "Failed to delete academic year" });
  }
}

// --- Section Controllers ---

export async function getSectionsController(req, res) {
  try {
    const yearId = req.query.yearId || req.params.yearId || null;
    const departmentId = req.query.departmentId || null;
    const sections = await findSectionsByYear(yearId, departmentId);
    return res.json({ sections });
  } catch (error) {
    console.error("Get sections error:", error);
    return res.status(500).json({ message: "Failed to fetch sections" });
  }
}

export async function createSectionController(req, res) {
  try {
    const { yearId, name } = req.body;

    if (!yearId || !name) {
      return res.status(400).json({ message: "Year ID and Section name are required" });
    }

    const cleanName = name.trim().toUpperCase();
    const existing = await findSectionByYearAndName(yearId, cleanName);
    if (existing) {
      return res.status(400).json({
        message: `Section "${cleanName}" already exists for this year`,
      });
    }

    const sectionId = await createSection({ yearId, name: cleanName });
    return res.status(201).json({
      message: "Section created successfully",
      sectionId,
    });
  } catch (error) {
    console.error("Create section error:", error);
    return res.status(500).json({ message: error.message || "Failed to create section" });
  }
}

export async function updateSectionController(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Section name is required" });
    }

    const section = await findSectionById(id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const cleanName = name.trim().toUpperCase();
    const existing = await findSectionByYearAndName(section.year_id, cleanName, id);
    if (existing) {
      return res.status(400).json({
        message: `Section "${cleanName}" already exists for this year`,
      });
    }

    await updateSection(id, { name: cleanName });
    return res.json({ message: "Section updated successfully" });
  } catch (error) {
    console.error("Update section error:", error);
    return res.status(500).json({ message: error.message || "Failed to update section" });
  }
}

export async function deleteSectionController(req, res) {
  try {
    const { id } = req.params;
    const section = await findSectionById(id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const [students] = await pool.query(
      `SELECT COUNT(*) AS count FROM students WHERE section_id = ?`,
      [id]
    );

    if (students[0]?.count > 0) {
      return res.status(400).json({
        message: `Cannot delete section with ${students[0].count} enrolled students.`,
      });
    }

    await deleteSection(id);
    return res.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Delete section error:", error);
    return res.status(500).json({ message: error.message || "Failed to delete section" });
  }
}
