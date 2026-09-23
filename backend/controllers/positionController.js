import {
  createPosition,
  findPositionsByElection,
  findPositionById,
  updatePosition,
  deletePosition
} from "../models/positionModel.js";

import {
  findElectionById
} from "../models/electionModel.js";

import {
  getAdminScope,
  checkAdminElectionScope,
  checkStudentElectionScope,
  UNAUTHORIZED_ELECTION_MESSAGE,
  STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
} from "../middleware/adminScopeMiddleware.js";
import { findStudentByUserId } from "../models/studentModel.js";

export async function createPositionController(req, res) {
  try {
    const electionId = req.body.electionId || req.body.election_id;
    const name = req.body.name ? req.body.name.trim() : "";
    const description = req.body.description ? req.body.description.trim() : null;

    if (!electionId || !name) {
      return res.status(400).json({
        message: "Election ID and position name are required"
      });
    }

    // Check election exists
    const election = await findElectionById(electionId);
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

    // Don't allow adding positions after election becomes ACTIVE / CLOSED / RESULT_PUBLISHED
    if (
      election.status === "ACTIVE" ||
      election.status === "CLOSED" ||
      election.status === "RESULT_PUBLISHED"
    ) {
      return res.status(400).json({
        message: "Cannot add position after election has started"
      });
    }

    const positionId = await createPosition({
      electionId,
      name,
      description
    });

    return res.status(201).json({
      message: "Position created successfully",
      positionId
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      return res.status(400).json({
        message: "A position with this name already exists in this election"
      });
    }

    console.error("Create position error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create position"
    });
  }
}

export async function getPositionsByElection(req, res) {
  try {
    const { electionId } = req.params;

    const election = await findElectionById(electionId);
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
    } else if (req.user?.role === "STUDENT") {
      const student = await findStudentByUserId(req.user.userId || req.user.id);
      if (!student || !checkStudentElectionScope(student, election)) {
        return res.status(403).json({
          success: false,
          message: STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    const positions = await findPositionsByElection(electionId);

    return res.json({
      positions
    });

  } catch (error) {
    console.error("Get positions error:", error);

    return res.status(500).json({
      message: "Failed to fetch positions"
    });
  }
}

export async function getPositionByIdController(req, res) {
  try {
    const { id } = req.params;

    const position = await findPositionById(id);
    if (!position) {
      return res.status(404).json({
        message: "Position not found"
      });
    }

    if (req.user?.role === "ADMIN") {
      const election = await findElectionById(position.election_id);
      const adminScope = await getAdminScope(req.user.userId || req.user.id);
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    } else if (req.user?.role === "STUDENT") {
      const election = await findElectionById(position.election_id);
      const student = await findStudentByUserId(req.user.userId || req.user.id);
      if (!student || !checkStudentElectionScope(student, election)) {
        return res.status(403).json({
          success: false,
          message: STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
        });
      }
    }

    return res.json({
      position
    });

  } catch (error) {
    console.error("Get position error:", error);

    return res.status(500).json({
      message: "Failed to fetch position"
    });
  }
}

export async function updatePositionController(req, res) {
  try {
    const { id } = req.params;

    const position = await findPositionById(id);
    if (!position) {
      return res.status(404).json({
        message: "Position not found"
      });
    }

    const election = await findElectionById(position.election_id);

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

    if (
      election &&
      (election.status === "ACTIVE" ||
        election.status === "CLOSED" ||
        election.status === "RESULT_PUBLISHED")
    ) {
      return res.status(400).json({
        message: "Cannot update position after election has started"
      });
    }

    const name = req.body.name !== undefined ? req.body.name.trim() : position.name;
    const description = req.body.description !== undefined
      ? (req.body.description ? req.body.description.trim() : null)
      : position.description;

    if (!name) {
      return res.status(400).json({
        message: "Position name is required"
      });
    }

    await updatePosition(id, name, description);

    return res.json({
      message: "Position updated successfully"
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      return res.status(400).json({
        message: "A position with this name already exists in this election"
      });
    }

    console.error("Update position error:", error);

    return res.status(500).json({
      message: error.message || "Failed to update position"
    });
  }
}

export async function deletePositionController(req, res) {
  try {
    const { id } = req.params;

    const position = await findPositionById(id);
    if (!position) {
      return res.status(404).json({
        message: "Position not found"
      });
    }

    const election = await findElectionById(position.election_id);

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

    if (
      election &&
      (election.status === "ACTIVE" ||
        election.status === "CLOSED" ||
        election.status === "RESULT_PUBLISHED")
    ) {
      return res.status(400).json({
        message: "Cannot delete position after election has started"
      });
    }

    await deletePosition(id);

    return res.json({
      message: "Position deleted successfully"
    });

  } catch (error) {
    console.error("Delete position error:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete position"
    });
  }
}