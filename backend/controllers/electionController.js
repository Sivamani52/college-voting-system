import {
  createElection,
  findAllElections,
  findElectionById,
  updateElectionStatus
} from "../models/electionModel.js";


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

    const electionId = await createElection({
      title,
      description,
      startDate: start,
      endDate: end,
      createdBy
    });

    return res.status(201).json({
      message: "Election created successfully",
      electionId
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

    const elections = await findAllElections();

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

    const election = await findElectionById(
      req.params.id
    );

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
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


export async function changeElectionStatus(req, res) {
  try {

    const { status } = req.body;

    const allowedStatuses = [
      "DRAFT",
      "UPCOMING",
      "ACTIVE",
      "CLOSED",
      "RESULT_PUBLISHED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid election status"
      });
    }

    const election = await findElectionById(
      req.params.id
    );

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    await updateElectionStatus(
      req.params.id,
      status
    );

    return res.json({
      message: "Election status updated successfully"
    });

  } catch (error) {

    console.error(
      "Update election status error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update election status"
    });
  }
}