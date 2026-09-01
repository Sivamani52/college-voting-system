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
