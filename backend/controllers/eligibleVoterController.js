import {
  addEligibleVoter,
  addBulkEligibleVoters,
  findEligibleVotersByElection,
  findEligibleVoter,
  findEligibleVoterById,
  removeEligibleVoter,
  removeEligibleVotersByElection
} from "../models/eligibleVoterModel.js";

import {
  findElectionById
} from "../models/electionModel.js";

import {
  findStudentByUserId,
  findStudentById
} from "../models/studentModel.js";

import {
  getAdminScope,
  checkAdminElectionScope,
  checkAdminStudentScope,
  checkStudentElectionScope,
  UNAUTHORIZED_ELECTION_MESSAGE,
  STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
} from "../middleware/adminScopeMiddleware.js";

import pool from "../config/db.js";

export async function addEligibleVoterController(
  req,
  res
) {
  try {
    const {
      electionId,
      studentId
    } = req.body;

    if (!electionId || !studentId) {
      return res.status(400).json({
        message:
          "Election ID and student ID are required"
      });
    }

    // Check election
    const election =
      await findElectionById(electionId);

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    // Enforce Admin section scope on election
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    // Don't modify eligibility after election starts
    if (
      election.status === "ACTIVE" ||
      election.status === "CLOSED" ||
      election.status === "RESULT_PUBLISHED"
    ) {
      return res.status(400).json({
        message:
          "Cannot modify eligible voters after election has started"
      });
    }

    // Check student (supports integer internal ID or student_id string code)
    const [students] = await pool.query(
      `SELECT *
       FROM students
       WHERE (id = ? OR student_id = ?)
       AND status = 'ACTIVE'
       LIMIT 1`,
      [studentId, studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        message:
          "Active student not found"
      });
    }

    const studentRecord = students[0];

    // Enforce ADMIN department/year/section scope on student
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminStudentScope(adminScope, studentRecord)) {
        return res.status(403).json({
          success: false,
          message: "You cannot add students outside your assigned section as eligible voters."
        });
      }
    }

    // Check duplicate
    const existing =
      await findEligibleVoter({
        electionId,
        studentId: studentRecord.id
      });

    if (existing) {
      return res.status(409).json({
        message:
          "Student is already eligible for this election"
      });
    }

    const id =
      await addEligibleVoter({
        electionId,
        studentId: studentRecord.id
      });

    return res.status(201).json({
      message:
        "Student added as eligible voter",
      eligibleVoterId: id
    });

  } catch (error) {
    console.error(
      "Add eligible voter error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to add eligible voter"
    });
  }
}

export async function addBulkEligibleVotersController(
  req,
  res
) {
  try {
    let {
      electionId,
      departmentId,
      yearId,
      sectionId,
      studentIds
    } = req.body;

    if (!electionId) {
      return res.status(400).json({
        message: "Election ID is required"
      });
    }

    const election = await findElectionById(electionId);
    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    if (
      election.status === "ACTIVE" ||
      election.status === "CLOSED" ||
      election.status === "RESULT_PUBLISHED"
    ) {
      return res.status(400).json({
        message: "Cannot modify eligible voters after election has started"
      });
    }

    // Enforce ADMIN section scoping on election and bulk criteria
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }

      departmentId = adminScope.department_id;
      // If admin has a specific year/section, enforce them; otherwise use election's scope
      yearId = adminScope.year_id !== null && adminScope.year_id !== undefined ? adminScope.year_id : (election.year_id || yearId || null);
      sectionId = adminScope.section_id !== null && adminScope.section_id !== undefined ? adminScope.section_id : (election.section_id || sectionId || null);
    } else if (req.user?.role === "SUPER_ADMIN") {
      departmentId = departmentId || election.department_id || null;
      yearId = yearId || election.year_id || null;
      sectionId = sectionId || election.section_id || null;
    }

    let targetStudentIds = [];

    // Option A: Explicit array of student IDs / codes
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      let query = `SELECT id, department_id, year_id, section_id FROM students WHERE (id IN (?) OR student_id IN (?)) AND status = 'ACTIVE'`;
      const queryParams = [studentIds, studentIds];

      if (departmentId) {
        query += ` AND department_id = ?`;
        queryParams.push(departmentId);
      }
      if (yearId) {
        query += ` AND year_id = ?`;
        queryParams.push(yearId);
      }
      if (sectionId) {
        query += ` AND section_id = ?`;
        queryParams.push(sectionId);
      }

      const [students] = await pool.query(query, queryParams);
      targetStudentIds = students.map(s => s.id);
    } 
    // Option B: Query active students by department / year / section
    else {
      let query = `SELECT id FROM students WHERE status = 'ACTIVE'`;
      const queryParams = [];

      if (departmentId) {
        query += ` AND department_id = ?`;
        queryParams.push(departmentId);
      }
      if (yearId) {
        query += ` AND year_id = ?`;
        queryParams.push(yearId);
      }
      if (sectionId) {
        query += ` AND section_id = ?`;
        queryParams.push(sectionId);
      }

      const [students] = await pool.query(query, queryParams);
      targetStudentIds = students.map(s => s.id);
    }

    if (targetStudentIds.length === 0) {
      return res.status(404).json({
        message: "No active students found matching your assigned section criteria"
      });
    }

    const addedCount = await addBulkEligibleVoters(electionId, targetStudentIds);

    return res.status(201).json({
      message: `${addedCount} eligible voters added successfully`,
      totalAdded: addedCount
    });

  } catch (error) {
    console.error("Bulk add eligible voters error:", error);
    return res.status(500).json({
      message: "Failed to add eligible voters in bulk"
    });
  }
}

export async function getEligibleVotersController(
  req,
  res
) {
  try {
    const {
      electionId
    } = req.params;

    const election =
      await findElectionById(electionId);

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    // Enforce Admin section scope
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    const voters =
      await findEligibleVotersByElection(
        electionId
      );

    return res.json({
      eligibleVoters: voters
    });

  } catch (error) {
    console.error(
      "Get eligible voters error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch eligible voters"
    });
  }
}

export async function getEligibleVoterByIdController(
  req,
  res
) {
  try {
    const { id } = req.params;

    const voter = await findEligibleVoterById(id);

    if (!voter) {
      return res.status(404).json({
        message: "Eligible voter record not found"
      });
    }

    if (req.user?.role === "ADMIN") {
      const election = await findElectionById(voter.election_id);
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    return res.json({
      eligibleVoter: voter
    });

  } catch (error) {
    console.error("Get eligible voter error:", error);
    return res.status(500).json({
      message: "Failed to fetch eligible voter"
    });
  }
}

export async function checkMyEligibilityController(
  req,
  res
) {
  try {
    const { electionId } = req.params;
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const student = await findStudentByUserId(userId);
    if (!student) {
      return res.status(404).json({
        message: "Student record not found"
      });
    }

    const election = await findElectionById(electionId);
    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    if (!checkStudentElectionScope(student, election)) {
      return res.status(403).json({
        success: false,
        message: STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
      });
    }

    const eligible = await findEligibleVoter({
      electionId,
      studentId: student.id
    });

    return res.json({
      electionId: Number(electionId),
      isEligible: !!eligible,
      studentId: student.id,
      studentCode: student.student_id
    });

  } catch (error) {
    console.error("Check eligibility error:", error);
    return res.status(500).json({
      message: "Failed to check voter eligibility"
    });
  }
}

export async function removeEligibleVoterController(
  req,
  res
) {
  try {
    const {
      id
    } = req.params;

    const voter = await findEligibleVoterById(id);

    if (!voter) {
      return res.status(404).json({
        message: "Eligible voter not found"
      });
    }

    const election = await findElectionById(voter.election_id);

    // Enforce ADMIN section scoping on election
    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    if (
      election && (
        election.status === "ACTIVE" ||
        election.status === "CLOSED" ||
        election.status === "RESULT_PUBLISHED"
      )
    ) {
      return res.status(400).json({
        message: "Cannot modify eligible voters after election has started"
      });
    }

    await removeEligibleVoter(id);

    return res.json({
      message:
        "Eligible voter removed successfully"
    });

  } catch (error) {
    console.error(
      "Remove eligible voter error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to remove eligible voter"
    });
  }
}

export async function removeAllEligibleVotersController(
  req,
  res
) {
  try {
    const { electionId } = req.params;

    const election = await findElectionById(electionId);
    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    if (req.user?.role === "ADMIN") {
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    } else if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        message: "Unauthorized"
      });
    }

    if (
      election.status === "ACTIVE" ||
      election.status === "CLOSED" ||
      election.status === "RESULT_PUBLISHED"
    ) {
      return res.status(400).json({
        message: "Cannot modify eligible voters after election has started"
      });
    }

    const removedCount = await removeEligibleVotersByElection(electionId);

    return res.json({
      message: `${removedCount} eligible voters removed successfully`,
      totalRemoved: removedCount
    });

  } catch (error) {
    console.error("Remove all eligible voters error:", error);
    return res.status(500).json({
      message: "Failed to remove eligible voters"
    });
  }
}