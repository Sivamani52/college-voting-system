import {
  createElection,
  findAllElections,
  findElectionById,
  updateElectionDetails,
  updateElectionStatus,
  deleteElection
} from "../models/electionModel.js";
import {
  getAdminScope,
  checkAdminElectionScope,
  checkStudentElectionScope,
  UNAUTHORIZED_ELECTION_MESSAGE,
  STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
} from "../middleware/adminScopeMiddleware.js";
import { findStudentByUserId } from "../models/studentModel.js";
import { isEligibleVoter } from "../models/voteModel.js";
import pool from "../config/db.js";
import { addBulkEligibleVoters } from "../models/eligibleVoterModel.js";

export async function createElectionController(req, res) {
  try {
    const rawStartDate = req.body.startDate || req.body.start_date;
    const rawEndDate = req.body.endDate || req.body.end_date;
    const title = req.body.title ? req.body.title.trim() : "";
    const description = req.body.description ? req.body.description.trim() : null;

    if (!title || !rawStartDate || !rawEndDate) {
      return res.status(400).json({
        message: "Title, start date and end date are required"
      });
    }

    const start = new Date(rawStartDate);
    const end = new Date(rawEndDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid date format"
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date"
      });
    }

    const createdBy = req.user?.userId || req.user?.id;
    if (!createdBy) {
      return res.status(401).json({
        message: "User ID not found in token"
      });
    }

    let departmentId = null;
    let yearId = null;
    let sectionId = null;

    // Enforce ADMIN scoping from database - never trust client input
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(createdBy);
      if (!adminScope || !adminScope.department_id) {
        return res.status(403).json({
          success: false,
          message: "Admin does not have an assigned department. Please contact Super Admin."
        });
      }

      departmentId = adminScope.department_id;
      // If admin is section-specific, enforce their year & section.
      // If admin is top branch admin, allow year/section to be specified or null.
      yearId = adminScope.year_id !== null && adminScope.year_id !== undefined ? adminScope.year_id : (req.body.yearId || req.body.year_id || null);
      sectionId = adminScope.section_id !== null && adminScope.section_id !== undefined ? adminScope.section_id : (req.body.sectionId || req.body.section_id || null);
    } else if (req.user?.role === "SUPER_ADMIN") {
      // Super Admin can optionally create election for a specific section or leave null
      departmentId = req.body.departmentId || req.body.department_id || null;
      yearId = req.body.yearId || req.body.year_id || null;
      sectionId = req.body.sectionId || req.body.section_id || null;
    }

    const electionId = await createElection({
      title,
      description,
      startDate: start,
      endDate: end,
      departmentId,
      yearId,
      sectionId,
      createdBy
    });

    // Auto-enroll ONLY the respected students belonging to this admin or superadmin scope
    let autoEnrolledCount = 0;
    try {
      let studentQuery = `SELECT id FROM students WHERE status = 'ACTIVE'`;
      const studentQueryParams = [];

      if (departmentId) {
        studentQuery += ` AND department_id = ?`;
        studentQueryParams.push(departmentId);
      }
      if (yearId) {
        studentQuery += ` AND year_id = ?`;
        studentQueryParams.push(yearId);
      }
      if (sectionId) {
        studentQuery += ` AND section_id = ?`;
        studentQueryParams.push(sectionId);
      }

      const [students] = await pool.query(studentQuery, studentQueryParams);
      if (students.length > 0) {
        const studentIds = students.map(s => s.id);
        autoEnrolledCount = await addBulkEligibleVoters(electionId, studentIds);
      }
    } catch (voterErr) {
      console.warn("Auto-enroll voters warning:", voterErr.message);
    }

    return res.status(201).json({
      message: "Election created successfully",
      electionId,
      autoEnrolledCount
    });

  } catch (error) {
    console.error("Create election error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create election"
    });
  }
}

export async function getAllElections(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId || req.user?.id;

    let filterOptions = {};

    if (userRole === "ADMIN") {
      const adminScope = await getAdminScope(userId);
      if (!adminScope) {
        return res.status(403).json({
          message: "Admin profile not found"
        });
      }

      // Return elections belonging to Admin's assigned Department (and Year + Section if restricted)
      filterOptions = {
        departmentId: adminScope.department_id,
        yearId: adminScope.year_id !== null && adminScope.year_id !== undefined ? adminScope.year_id : undefined,
        sectionId: adminScope.section_id !== null && adminScope.section_id !== undefined ? adminScope.section_id : undefined
      };
    } else if (userRole === "STUDENT") {
      const student = await findStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({
          message: "Student record not found"
        });
      }

      // Students only see elections belonging to their assigned section (or college-wide) where they are registered as eligible voters, excluding DRAFT
      filterOptions = {
        studentId: student.id,
        studentDepartmentId: student.department_id,
        studentYearId: student.year_id,
        studentSectionId: student.section_id,
        excludeDrafts: true
      };
    }
    // SUPER_ADMIN has filterOptions = {} (all elections)

    const elections = await findAllElections(filterOptions);

    return res.json({
      elections
    });

  } catch (error) {
    console.error("Get elections error:", error);

    return res.status(500).json({
      message: "Failed to fetch elections"
    });
  }
}

export async function getElectionById(req, res) {
  try {
    const election = await findElectionById(req.params.id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    const userRole = req.user?.role;
    const userId = req.user?.userId || req.user?.id;

    if (userRole === "ADMIN") {
      const adminScope = await getAdminScope(userId);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    } else if (userRole === "STUDENT") {
      if (election.status === "DRAFT") {
        return res.status(403).json({
          message: "Students cannot view draft elections"
        });
      }

      const student = await findStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({
          message: "Student profile not found"
        });
      }

      // Strictly verify election belongs to student's section or is college-wide
      if (!checkStudentElectionScope(student, election)) {
        return res.status(403).json({
          success: false,
          message: STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
        });
      }

      const eligible = await isEligibleVoter(election.id, student.id);
      if (!eligible) {
        return res.status(403).json({
          message: "You are not registered as an eligible voter for this election."
        });
      }
    }

    return res.json({
      election
    });

  } catch (error) {
    console.error("Get election error:", error);

    return res.status(500).json({
      message: "Failed to fetch election"
    });
  }
}

export async function updateElectionController(req, res) {
  try {
    const { id } = req.params;
    const election = await findElectionById(id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    const userRole = req.user?.role;
    const userId = req.user?.userId || req.user?.id;

    if (userRole === "ADMIN") {
      const adminScope = await getAdminScope(userId);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    // Don't allow changing details after election has started
    if (["ACTIVE", "CLOSED", "RESULT_PUBLISHED"].includes(election.status)) {
      return res.status(400).json({
        message: `Cannot update election details when election is in ${election.status} status`
      });
    }

    const { title, description, startDate, endDate, start_date, end_date } = req.body;
    const finalStartDate = startDate || start_date;
    const finalEndDate = endDate || end_date;

    if (finalStartDate && finalEndDate) {
      const start = new Date(finalStartDate);
      const end = new Date(finalEndDate);
      if (end <= start) {
        return res.status(400).json({
          message: "End date must be after start date"
        });
      }
    }

    await updateElectionDetails(id, {
      title,
      description,
      startDate: finalStartDate,
      endDate: finalEndDate
    });

    const updated = await findElectionById(id);
    return res.json({
      message: "Election updated successfully",
      election: updated
    });

  } catch (error) {
    console.error("Update election error:", error);
    return res.status(500).json({
      message: "Failed to update election"
    });
  }
}

export async function changeElectionStatus(req, res) {
  try {
    const { id } = req.params;
    let status = req.body.status;

    // Support action endpoint aliases if status is not explicitly passed in body
    if (!status) {
      if (req.path.endsWith("/activate")) status = "ACTIVE";
      else if (req.path.endsWith("/close")) status = "CLOSED";
      else if (req.path.endsWith("/publish-results")) status = "RESULT_PUBLISHED";
    }

    const allowedStatuses = [
      "DRAFT",
      "UPCOMING",
      "ACTIVE",
      "CLOSED",
      "RESULT_PUBLISHED"
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid election status. Allowed: DRAFT, UPCOMING, ACTIVE, CLOSED, RESULT_PUBLISHED"
      });
    }

    const election = await findElectionById(id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    const userRole = req.user?.role;
    const userId = req.user?.userId || req.user?.id;

    if (userRole === "ADMIN") {
      const adminScope = await getAdminScope(userId);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    if (election.status === status) {
      return res.json({
        message: `Election is already in ${status} status`
      });
    }

    // Valid state transitions
    const validTransitions = {
      DRAFT: ["UPCOMING", "ACTIVE"],
      UPCOMING: ["DRAFT", "ACTIVE"],
      ACTIVE: ["CLOSED"],
      CLOSED: ["RESULT_PUBLISHED"],
      RESULT_PUBLISHED: []
    };

    const allowedNext = validTransitions[election.status] || [];

    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition election status from ${election.status} to ${status}`
      });
    }

    await updateElectionStatus(id, status);

    return res.json({
      message: "Election status updated successfully",
      previousStatus: election.status,
      currentStatus: status
    });

  } catch (error) {
    console.error("Update election status error:", error);

    return res.status(500).json({
      message: "Failed to update election status"
    });
  }
}

export async function deleteElectionController(req, res) {
  try {
    const { id } = req.params;

    const election = await findElectionById(id);
    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    const userRole = req.user?.role;
    const userId = req.user?.userId || req.user?.id;

    if (userRole === "ADMIN") {
      const adminScope = await getAdminScope(userId);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    await deleteElection(id);

    return res.json({
      message: "Election deleted successfully"
    });
  } catch (error) {
    console.error("Delete election error:", error);
    return res.status(500).json({
      message: "Failed to delete election"
    });
  }
}