import api from "./api";

// Get logged-in student's profile
export const getMyProfile = async () => {
  const response = await api.get("/students/profile");
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
export const getMyVotes = async (electionId) => {
  const response = await api.get(`/votes/my-votes/${electionId}`);
  return response.data;
};

// Cast a vote
export const castVote = async ({ electionId, positionId, candidateId }) => {
  const response = await api.post("/votes", {
    electionId: Number(electionId),
    positionId: Number(positionId),
    candidateId: Number(candidateId),
  });
  return response.data;
};

// Get election results (when published)
export const getElectionResults = async (electionId) => {
  const response = await api.get(`/votes/results/${electionId}`);
  return response.data;
};