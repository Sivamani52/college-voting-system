import api from "./api";

/**
 * Fetch all elections
 */
export const getAllElections = async () => {
  const response = await api.get("/elections");
  return response.data;
};

/**
 * Fetch election by ID
 */
export const getElectionById = async (id) => {
  const response = await api.get(`/elections/${id}`);
  return response.data;
};

/**
 * Create new election (Super Admin only)
 */
export const createElection = async ({ title, description, startDate, endDate }) => {
  const response = await api.post("/elections", {
    title,
    description,
    startDate,
    endDate,
  });
  return response.data;
};

/**
 * Update election status (e.g. CLOSED, RESULT_PUBLISHED, ACTIVE)
 */
export const updateElectionStatus = async (id, status) => {
  const response = await api.patch(`/elections/${id}/status`, { status });
  return response.data;
};

/**
 * Delete election
 */
export const deleteElection = async (id) => {
  const response = await api.delete(`/elections/${id}`);
  return response.data;
};

/**
 * Fetch election results
 */
export const getElectionResults = async (electionId) => {
  try {
    const response = await api.get(`/results/election/${electionId}`);
    return response.data;
  } catch {
    try {
      const response = await api.get(`/results/${electionId}`);
      return response.data;
    } catch {
      const response = await api.get(`/votes/results/${electionId}`);
      return response.data;
    }
  }
};

/**
 * Fetch turnout stats
 */
export const getElectionStats = async (electionId) => {
  const response = await api.get(`/votes/stats/${electionId}`);
  return response.data;
};

/**
 * Create a new position
 */
export const createPosition = async (positionData) => {
  const response = await api.post("/positions", positionData);
  return response.data;
};

/**
 * Create a new candidate
 */
export const createCandidate = async (candidateData) => {
  const response = await api.post("/candidates", candidateData);
  return response.data;
};

/**
 * Fetch positions by election
 */
export const getPositionsByElection = async (electionId) => {
  const response = await api.get(`/positions/election/${electionId}`);
  return response.data;
};

/**
 * Fetch candidates by election
 */
export const getCandidatesByElection = async (electionId) => {
  const response = await api.get(`/candidates/election/${electionId}`);
  return response.data;
};

/**
 * Fetch eligible voters by election
 */
export const getEligibleVotersByElection = async (electionId) => {
  const response = await api.get(`/eligible-voters/election/${electionId}`);
  return response.data;
};

/**
 * Add eligible voter (Admin, Super Admin)
 */
export const addEligibleVoter = async (voterData) => {
  const response = await api.post("/eligible-voters", voterData);
  return response.data;
};

/**
 * Bulk add eligible voters (Admin, Super Admin)
 */
export const addBulkEligibleVoters = async (bulkData) => {
  const response = await api.post("/eligible-voters/bulk", bulkData);
  return response.data;
};

/**
 * Remove eligible voter (Admin, Super Admin)
 */
export const removeEligibleVoter = async (id) => {
  const response = await api.delete(`/eligible-voters/${id}`);
  return response.data;
};

/**
 * Fetch all admins (Super Admin only)
 */
export const getAllAdmins = async () => {
  const response = await api.get("/admins");
  return response.data;
};

/**
 * Create new admin (Super Admin only)
 */
export const createAdmin = async (adminData) => {
  const response = await api.post("/admins", adminData);
  return response.data;
};

/**
 * Fetch all students
 */
export const getAllStudents = async () => {
  const response = await api.get("/students");
  return response.data;
};

/**
 * Create new student
 */
export const createStudent = async (studentData) => {
  const response = await api.post("/students", studentData);
  return response.data;
};

export default {
  getAllElections,
  getElectionById,
  createElection,
  updateElectionStatus,
  getElectionResults,
  getElectionStats,
  getAllAdmins,
  createAdmin,
  getAllStudents,
  createStudent,
};
