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
  ArrowRight,
} from "lucide-react";
import {
  getElectionById,
  checkEligibility,
  getPositionsByElection,
  getCandidatesByElection,
  getMyVotes,
  getElectionResults,
} from "../../services/studentService";
import Navbar from "../../components/common/Navbar";
import Alert from "../../components/common/Alert";
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

  // Selected candidate ID per position: { [positionId]: candidateId }
  const [selectedCandidates, setSelectedCandidates] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadElectionData = useCallback(async () => {
    try {
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

  // Select / deselect candidate for a position
  const handleSelectCandidate = (position, candidate) => {
    setSelectedCandidates((prev) => {
      const current = prev[position.id];
      if (current === candidate.id) {
        const copy = { ...prev };
        delete copy[position.id];
        return copy;
      }
      return {
        ...prev,
        [position.id]: candidate.id,
      };
    });
  };

  // Proceed to review and confirm votes
  const handleProceedToReview = () => {
    const count = Object.keys(selectedCandidates).length;
    if (count === 0) {
      setFeedback({
        type: "warning",
        message: "Please select at least one candidate before proceeding to review your ballot.",
      });
      return;
    }

    navigate("/student/confirm-vote", {
      state: {
        election,
        positions,
        candidates,
        selectedCandidates,
      },
    });
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
  const selectedCount = Object.keys(selectedCandidates).length;
  const unvotedPositionsCount = positions.filter((p) => !hasVotedForPosition(p.id)).length;
  const isAllVoted = positions.length > 0 && unvotedPositionsCount === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
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
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {election.title}
                </h1>
                <ElectionStatusBadge status={election.status} />
              </div>
              <p className="text-gray-600 text-sm max-w-2xl">
                {election.description || "Official college election."}
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs text-gray-500 shrink-0 bg-gray-50 p-3 rounded-2xl border border-gray-100">
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
              <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold">Eligible Voter:</span> You are registered on the official voter roster for this election.
                  </div>
                </div>
                {isAllVoted && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    <CheckCircle2 size={14} /> All Positions Voted
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
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
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Vote size={22} className="text-blue-600" />
              Positions & Candidates ({positions.length})
            </h2>
            {isElectionActive && (
              <span className="text-xs text-gray-500 font-medium">
                {myVotes.length} of {positions.length} votes recorded
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
              const selectedBatchCandId = selectedCandidates[pos.id];

              return (
                <div
                  key={pos.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs"
                >
                  <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{pos.title || pos.name}</h3>
                      {pos.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{pos.description}</p>
                      )}
                    </div>
                    <div>
                      {voted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 size={14} /> Vote Cast
                        </span>
                      ) : selectedBatchCandId ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          Choice Selected
                        </span>
                      ) : isElectionActive && isEligible ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Selection Pending
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
                            isSelectedForBatch={selectedBatchCandId === Number(cand.id)}
                            hasVotedForPosition={voted}
                            isElectionActive={isElectionActive}
                            isEligible={isEligible}
                            onSelectCandidate={handleSelectCandidate}
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

      {/* Floating Review & Submit Action Bar for Active Election */}
      {isElectionActive && isEligible && unvotedPositionsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-4 px-4 sm:px-8 shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-gray-900">
                {selectedCount} candidate{selectedCount === 1 ? "" : "s"} selected
              </p>
              <p className="text-xs text-gray-500">
                Review your selections before final transaction submission.
              </p>
            </div>

            <button
              onClick={handleProceedToReview}
              disabled={selectedCount === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Review & Submit Vote ({selectedCount})</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}