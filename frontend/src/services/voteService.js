import api from "./api";

/**
 * Submit all selected votes in a single transaction request.
 * Payload format:
 * {
 *   "election_id": 1,
 *   "votes": [
 *     { "position_id": 1, "candidate_id": 5 },
 *     { "position_id": 2, "candidate_id": 8 }
 *   ]
 * }
 * student_id is omitted and automatically extracted by backend from JWT.
 */
export const submitVotes = async ({ election_id, votes }) => {
  const payload = {
    election_id: Number(election_id),
    votes: votes.map((v) => ({
      position_id: Number(v.position_id ?? v.positionId),
      candidate_id: Number(v.candidate_id ?? v.candidateId),
    })),
  };

  const response = await api.post("/votes", payload);
  return response.data;
};

/**
 * Alias for submitVotes
 */
export const castVote = submitVotes;

/**
 * Fetch all votes cast by the authenticated student in an election.
 */
export const getMyVotes = async (electionId) => {
  const response = await api.get(`/votes/my-votes/${electionId}`);
  return response.data;
};

/**
 * Fetch published election results.
 */
export const getElectionResults = async (electionId) => {
  const response = await api.get(`/votes/results/${electionId}`);
  return response.data;
};

/**
 * Fetch election statistics.
 */
export const getElectionStats = async (electionId) => {
  const response = await api.get(`/votes/stats/${electionId}`);
  return response.data;
};

export default {
  submitVotes,
  castVote,
  getMyVotes,
  getElectionResults,
  getElectionStats,
};
