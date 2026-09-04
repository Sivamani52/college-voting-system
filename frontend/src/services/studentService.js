import api from "./api";
import { submitVotes as submitVotesApi, getMyVotes as getMyVotesApi, getElectionResults as getElectionResultsApi } from "./voteService";

// Get logged-in student's profile
export const getMyProfile = async () => {
  const response = await api.get("/students/profile");
  return response.data;
};

// Get logged-in admin's profile
export const getMyAdminProfile = async () => {
  const response = await api.get("/admins/profile");
  return response.data;
};

// Get all students (scoped by backend based on role)
export const getAllStudents = async (params) => {
  const response = await api.get("/students", { params });
  return response.data;
};

// Create a new student
export const createStudent = async (studentData) => {
  const response = await api.post("/students", studentData);
  return response.data;
};

// Get elections available to the logged-in student
export const getMyElections = async () => {
  const response = await api.get("/elections");
  return response.data;
};

// Get election by ID
export const getElectionById = async (id) => {
  const response = await api.get(`/elections/${id}`);
  return response.data;
};

// Check voter eligibility for an election
export const checkEligibility = async (electionId) => {
  const response = await api.get(`/eligible-voters/check/${electionId}`);
  return response.data;
};

// Get positions for an election
export const getPositionsByElection = async (electionId) => {
  const response = await api.get(`/positions/election/${electionId}`);
  return response.data;
};

// Get candidates for an election
export const getCandidatesByElection = async (electionId) => {
  const response = await api.get(`/candidates/election/${electionId}`);
  return response.data;
};

// Get my cast votes for an election
export const getMyVotes = getMyVotesApi;

// Submit votes using transaction-based batch API
export const submitVotes = submitVotesApi;

// Cast vote (supports both batch format { election_id, votes } and single { electionId, positionId, candidateId })
export const castVote = async (data) => {
  if (data.votes && Array.isArray(data.votes)) {
    return submitVotesApi(data);
  }
  return submitVotesApi({
    election_id: data.electionId || data.election_id,
    votes: [
      {
        position_id: data.positionId || data.position_id,
        candidate_id: data.candidateId || data.candidate_id,
      },
    ],
  });
};

// Get election results (when published)
export const getElectionResults = getElectionResultsApi;
