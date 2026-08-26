import {
  createCandidate,
  findCandidatesByElection,
  findCandidatesByPosition,
  findCandidateById,
  updateCandidate,
  deleteCandidate
} from "../models/candidateModel.js";

import {
  findElectionById
} from "../models/electionModel.js";

import {
  findPositionById
} from "../models/positionModel.js";

import pool from "../config/db.js";


export async function createCandidateController(
  req,
  res
) {
  try {
    const {
      electionId,
      positionId,
      studentId,
      manifesto,
      photoUrl
    } = req.body;

    if (
      !electionId ||
      !positionId ||
      !studentId
    ) {
      return res.status(400).json({
        message:
          "Election ID, position ID and student ID are required"
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

    // Don't allow candidates after election starts
    if (
      election.status === "ACTIVE" ||
      election.status === "CLOSED" ||
      election.status === "RESULT_PUBLISHED"
    ) {
      return res.status(400).json({
        message:
          "Cannot add candidate after election has started"
      });
    }

    // Check position
    const position =
      await findPositionById(positionId);

    if (!position) {
      return res.status(404).json({
        message: "Position not found"
      });
    }

    // Make sure position belongs to election
    if (
      Number(position.election_id) !==
      Number(electionId)
    ) {
      return res.status(400).json({
        message:
          "Position does not belong to this election"
      });
    }

    // Check student (supports internal id or student_id string code)
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

    // Check whether student is already candidate for this position in this election
    const [existing] = await pool.query(
      `SELECT id
       FROM candidates
       WHERE election_id = ?
       AND position_id = ?
       AND student_id = ?
       LIMIT 1`,
      [
        electionId,
        positionId,
        studentRecord.id
      ]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message:
          "Student is already a candidate for this position"
      });
    }

    const candidateId =
      await createCandidate({
        electionId,
        positionId,
        studentId: studentRecord.id,
        manifesto,
        photoUrl
      });

    return res.status(201).json({
      message:
        "Candidate created successfully",
      candidateId
    });

  } catch (error) {
    console.error(
      "Create candidate error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create candidate"
    });
  }
}


export async function getCandidatesByElection(
  req,
  res
) {
  try {
    const { electionId } = req.params;

    const election =
      await findElectionById(electionId);

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    const candidates =
      await findCandidatesByElection(
        electionId
      );

    return res.json({
      candidates
    });

  } catch (error) {
    console.error(
      "Get candidates error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch candidates"
    });
  }
}


export async function getCandidatesByPositionController(
  req,
  res
) {
  try {
    const { positionId } = req.params;

    const position =
      await findPositionById(positionId);

    if (!position) {
      return res.status(404).json({
        message: "Position not found"
      });
    }

    const candidates =
      await findCandidatesByPosition(
        positionId
      );

    return res.json({
      candidates
    });

  } catch (error) {
    console.error(
      "Get candidates by position error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch candidates for position"
    });
  }
}


export async function getCandidateByIdController(
  req,
  res
) {
  try {
    const { id } = req.params;

    const candidate =
      await findCandidateById(id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found"
      });
    }

    return res.json({
      candidate
    });

  } catch (error) {
    console.error(
      "Get candidate error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch candidate"
    });
  }
}


export async function updateCandidateController(
  req,
  res
) {
  try {
    const { id } = req.params;

    const {
      manifesto,
      photoUrl,
      status
    } = req.body;

    const candidate =
      await findCandidateById(id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found"
      });
    }

    const election =
      await findElectionById(
        candidate.election_id
      );

    if (
      election && (
        election.status === "ACTIVE" ||
        election.status === "CLOSED" ||
        election.status === "RESULT_PUBLISHED"
      )
    ) {
      return res.status(400).json({
        message:
          "Cannot update candidate after election has started"
      });
    }

    const allowedStatuses = [
      "ACTIVE",
      "INACTIVE"
    ];

    const finalStatus =
      status || candidate.status;

    if (
      !allowedStatuses.includes(
        finalStatus
      )
    ) {
      return res.status(400).json({
        message: "Invalid candidate status"
      });
    }

    const finalManifesto =
      manifesto !== undefined
        ? manifesto
        : candidate.manifesto;

    const finalPhotoUrl =
      photoUrl !== undefined
        ? photoUrl
        : candidate.photo_url;

    await updateCandidate({
      id,
      manifesto: finalManifesto,
      photoUrl: finalPhotoUrl,
      status: finalStatus
    });

    return res.json({
      message:
        "Candidate updated successfully"
    });

  } catch (error) {
    console.error(
      "Update candidate error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update candidate"
    });
  }
}


export async function deleteCandidateController(
  req,
  res
) {
  try {
    const { id } = req.params;

    const candidate =
      await findCandidateById(id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found"
      });
    }

    const election =
      await findElectionById(
        candidate.election_id
      );

    if (
      election && (
        election.status === "ACTIVE" ||
        election.status === "CLOSED" ||
        election.status === "RESULT_PUBLISHED"
      )
    ) {
      return res.status(400).json({
        message:
          "Cannot delete candidate after election has started"
      });
    }

    await deleteCandidate(id);

    return res.json({
      message:
        "Candidate deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete candidate error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete candidate"
    });
  }
}