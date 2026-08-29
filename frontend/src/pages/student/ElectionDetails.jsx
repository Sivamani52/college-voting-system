import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Vote,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  getElectionById,
  checkEligibility,
  getPositionsByElection,
  getCandidatesByElection,
  getMyVotes,
  castVote,
  getElectionResults,
} from "../../services/studentService";
import Navbar from "../../components/common/Navbar";
import Alert from "../../components/common/Alert";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { ElectionStatusBadge } from "../../components/student/ElectionCard";
import CandidateCard from "../../components/student/CandidateCard";
import ElectionResultsView from "../../components/student/ElectionResultsView";

export default function ElectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votingLoading, setVotingLoading] = useState({});
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [confirmModal, setConfirmModal] = useState(null); // { position, candidate }

  const loadElectionData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const electionRes = await getElectionById(id);
      const currentElection = electionRes.election || electionRes;
      setElection(currentElection);

      // Parallel fetch supporting data
      const promises = [
        checkEligibility(id).catch((err) => ({
          isEligible: false,
          message: err.response?.data?.message || "Could not check eligibility",
        })),
        getPositionsByElection(id).catch(() => ({ positions: [] })),
        getCandidatesByElection(id).catch(() => ({ candidates: [] })),
        getMyVotes(id).catch(() => ({ votes: [] })),
      ];

      if (currentElection.status === "RESULT_PUBLISHED") {
        promises.push(getElectionResults(id).catch(() => ({ results: null })));
      }

      const resultsArray = await Promise.all(promises);
      const eligibilityData = resultsArray[0];
      const positionsData = resultsArray[1];
      const candidatesData = resultsArray[2];
      const votesData = resultsArray[3];
      const resultsData = resultsArray[4];

      setEligibility(eligibilityData);
      setPositions(positionsData.positions || positionsData.data || positionsData || []);
      setCandidates(candidatesData.candidates || candidatesData.data || candidatesData || []);
      setMyVotes(votesData.votes || votesData.data || votesData || []);

      if (resultsData) {
        setResults(resultsData.results || resultsData.data || resultsData);
      }
    } catch (err) {
      console.error("Failed to load election details:", err);
      setError(err.response?.data?.message || "Failed to load election details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadElectionData();
  }, [loadElectionData]);

  const handleCastVote = async (position, candidate) => {
    setConfirmModal(null);
    setFeedback({ type: "", message: "" });
    setVotingLoading((prev) => ({ ...prev, [position.id]: true }));

    try {
      await castVote({
        electionId: Number(id),
        positionId: position.id,
        candidateId: candidate.id,
      });

      setFeedback({
        type: "success",
        message: `Successfully voted for ${candidate.full_name || candidate.name || "candidate"} for ${position.title}!`,
      });

      // Refresh votes list
      const updatedVotes = await getMyVotes(id);
      setMyVotes(updatedVotes.votes || updatedVotes.data || updatedVotes || []);
    } catch (err) {
      console.error("Vote casting error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to cast vote. Please try again.",
      });
    } finally {
      setVotingLoading((prev) => ({ ...prev, [position.id]: false }));
    }
  };

  const hasVotedForPosition = (positionId) => {
    return myVotes.some(
      (v) => Number(v.position_id || v.positionId) === Number(positionId)
    );
  };

  const getVotedCandidateId = (positionId) => {
    const vote = myVotes.find(
      (v) => Number(v.position_id || v.positionId) === Number(positionId)
    );
    return vote ? Number(vote.candidate_id || vote.candidateId) : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading election details...</p>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Election</h2>
          <p className="text-gray-600 mb-6 text-sm">{error || "Election not found."}</p>
          <Link
            to="/student"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isEligible = eligibility?.isEligible ?? true;
  const isElectionActive = election.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Navbar */}
      <Navbar subtitle="Election Center" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate("/student")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            onDismiss={() => setFeedback({ type: "", message: "" })}
          />
        )}

        {/* Election Overview Hero */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {election.title}
                </h1>
                <ElectionStatusBadge status={election.status} />
              </div>
              <p className="text-gray-600 text-sm max-w-2xl">
                {election.description || "Official college election."}
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs text-gray-500 shrink-0 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {election.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  <span>
                    Starts: {new Date(election.start_date).toLocaleString()}
                  </span>
                </div>
              )}
              {election.end_date && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-orange-500" />
                  <span>
                    Ends: {new Date(election.end_date).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Eligibility Banner */}
          <div className="mt-6">
            {isEligible ? (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold">Eligible to Vote:</span> You are registered on the eligible voter roster for this election.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <div>
                  <span className="font-semibold">Not on Eligibility Roster:</span> {eligibility?.message || "You are not listed as an eligible voter for this election."}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results View if Published */}
        {election.status === "RESULT_PUBLISHED" && results && (
          <ElectionResultsView results={results} />
        )}

        {/* Positions & Candidates List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Vote size={22} className="text-blue-600" />
              Positions & Candidates ({positions.length})
            </h2>
            {isElectionActive && (
              <span className="text-xs text-gray-500 font-medium">
                {myVotes.length} of {positions.length} votes cast
              </span>
            )}
          </div>

          {positions.length === 0 ? (
            <EmptyState
              title="No positions listed"
              message="No positions have been created for this election yet."
            />
          ) : (
            positions.map((pos) => {
              const positionCandidates = candidates.filter(
                (c) => Number(c.position_id || c.positionId) === Number(pos.id)
              );
              const voted = hasVotedForPosition(pos.id);
              const votedCandidateId = getVotedCandidateId(pos.id);

              return (
                <div
                  key={pos.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs"
                >
                  <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{pos.title}</h3>
                      {pos.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{pos.description}</p>
                      )}
                    </div>
                    <div>
                      {voted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 size={14} /> Vote Cast
                        </span>
                      ) : isElectionActive && isEligible ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Vote Pending
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Voting Unavailable</span>
                      )}
                    </div>
                  </div>

                  {/* Candidates */}
                  <div className="p-6">
                    {positionCandidates.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No candidates nominated for this position yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {positionCandidates.map((cand) => (
                          <CandidateCard
                            key={cand.id}
                            candidate={cand}
                            position={pos}
                            isSelectedByVote={votedCandidateId === Number(cand.id)}
                            hasVotedForPosition={voted}
                            isElectionActive={isElectionActive}
                            isEligible={isEligible}
                            isVoting={votingLoading[pos.id]}
                            onVoteClick={(position, candidate) =>
                              setConfirmModal({ position, candidate })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title="Confirm Your Vote"
        icon={<Vote size={24} />}
        confirmText="Confirm Vote"
        cancelText="Cancel"
        onConfirm={() =>
          confirmModal &&
          handleCastVote(confirmModal.position, confirmModal.candidate)
        }
      >
        {confirmModal && (
          <p>
            Are you sure you want to vote for{" "}
            <span className="font-bold text-gray-900">
              {confirmModal.candidate.full_name || confirmModal.candidate.name}
            </span>{" "}
            for the position of{" "}
            <span className="font-bold text-gray-900">
              {confirmModal.position.title}
            </span>
            ? Once submitted, your vote cannot be changed.
          </p>
        )}
      </Modal>
    </div>
  );
}