import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Users,
  Vote,
  Calendar,
  CheckCircle2,
  Lock,
  Clock,
  Award,
  Send,
  ShieldCheck,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";
import Alert from "../../components/common/Alert";
import EmptyState from "../../components/common/EmptyState";
import {
  getElectionResults,
  updateElectionStatus,
} from "../../services/electionService";

export default function ElectionResults() {
  const params = useParams();
  const electionId = params.electionId || params.id;
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchResultsData = useCallback(async (isManualRefresh = false) => {
    if (!electionId) return;

    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const data = await getElectionResults(electionId);

      setElection(data.election || null);
      setStats(data.stats || null);
      setResults(data.results || data.data || []);
    } catch (err) {
      console.error("Super Admin Election Results Error:", err);
      const message =
        err.response?.data?.message ||
        "Failed to load election results. Please verify the election exists.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [electionId]);

  useEffect(() => {
    fetchResultsData();
  }, [fetchResultsData]);

  // Handle Publish Results Confirmation
  const handlePublishResults = async () => {
    try {
      setIsPublishing(true);

      await updateElectionStatus(electionId, "RESULT_PUBLISHED");

      toast.success(
        "Election results have been published successfully! Students can now view the official results."
      );

      setIsPublishModalOpen(false);

      // Re-fetch election & result data
      await fetchResultsData(true);
    } catch (err) {
      console.error("Publish results error:", err);
      const message =
        err.response?.data?.message ||
        "Failed to publish election results. Please try again.";
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const isClosed = election?.status === "CLOSED";
  const isPublished = election?.status === "RESULT_PUBLISHED";
  const isActive = election?.status === "ACTIVE";
  const isUpcoming = election?.status === "UPCOMING";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar subtitle="Super Admin Console" />
        <div className="max-w-md mx-auto my-auto p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Loading Election Results...</h2>
          <p className="text-gray-500 text-sm mt-1">
            Tabulating official ballots and voter analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar subtitle="Super Admin Console" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate("/superadmin")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={18} />
            Back to Super Admin Dashboard
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchResultsData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin text-blue-600" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {/* Publish Results Button (Only if CLOSED) */}
            {isClosed && (
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-xs transition"
              >
                <Send size={16} />
                <span>Publish Results</span>
              </button>
            )}

            {/* Results Published Indicator */}
            {isPublished && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-100 text-purple-800 text-sm font-bold rounded-xl border border-purple-200 shadow-xs">
                <Award size={16} className="text-purple-600" />
                Results Published
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Failed to Load Results
            </h2>

            <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
              {error}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => fetchResultsData(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition shadow-xs"
              >
                Try Again
              </button>
              <Link
                to="/superadmin"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Main Results View */}
        {!error && (
          <>
            {/* Status Information Notice */}
            {isPublished && (
              <Alert
                type="success"
                message="Results are officially published! Students and department administrators can now review the verified results."
              />
            )}

            {isClosed && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 text-amber-900 text-sm">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Voting is Closed:</span> Ballots are finalized. Review the tally below and click <strong>Publish Results</strong> when ready to release to students.
                  </div>
                </div>
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Publish Now
                </button>
              </div>
            )}

            {isActive && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-blue-900 text-sm">
                <Clock size={20} className="text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold">Election is Live & Active:</span> Votes are actively being submitted. Results shown here update in real-time. The election must be closed before results can be published.
                </div>
              </div>
            )}

            {isUpcoming && (
              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 flex items-center gap-3 text-gray-800 text-sm">
                <Clock size={20} className="text-gray-600 shrink-0" />
                <div>
                  <span className="font-bold">Election is Upcoming:</span> Voting has not started yet.
                </div>
              </div>
            )}

            {/* Header Hero Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      {election?.title || "Election Results Review"}
                    </h1>

                    {/* Status Badge */}
                    {isPublished && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        <Award size={13} />
                        Results Published
                      </span>
                    )}

                    {isClosed && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                        <Lock size={13} />
                        Closed
                      </span>
                    )}

                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live & Active
                      </span>
                    )}

                    {isUpcoming && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        <Clock size={13} />
                        Upcoming
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm max-w-3xl">
                    {election?.description ||
                      "Official Super Admin results review and tabulation dashboard."}
                  </p>
                </div>

                <div className="shrink-0 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1.5">
                  {election?.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-600" />
                      <span>
                        Starts: {new Date(election.startDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {election?.endDate && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-500" />
                      <span>
                        Ends: {new Date(election.endDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 font-semibold text-gray-900 pt-1 border-t border-gray-200">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Super Admin Certified</span>
                  </div>
                </div>
              </div>

              {/* KPI Metrics */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Votes Cast"
                  value={stats?.totalVotesCast?.toLocaleString() ?? 0}
                  icon={<Vote size={22} />}
                />
                <StatCard
                  title="Unique Voters"
                  value={stats?.uniqueVotersParticipated?.toLocaleString() ?? 0}
                  icon={<Users size={22} />}
                />
                <StatCard
                  title="Voter Turnout"
                  value={stats?.turnoutPercentage || "0%"}
                  icon={<CheckCircle2 size={22} />}
                />
                <StatCard
                  title="Contested Positions"
                  value={results.length}
                  icon={<BarChart3 size={22} />}
                />
              </div>
            </div>

            {/* Empty State */}
            {results.length === 0 && (
              <EmptyState
                icon={<BarChart3 size={32} />}
                title="No Position Results Available"
                message="There are no positions or candidate votes tabulated for this election yet."
              />
            )}

            {/* Position-wise Results */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Vote size={22} className="text-blue-600" />
                  <span>Position-wise Vote Tabulation ({results.length})</span>
                </h2>
                <span className="text-xs font-semibold text-gray-500">
                  Ordered by highest vote count
                </span>
              </div>

              {results.map((position) => {
                const candidates = position.candidates || [];
                const totalPosVotes =
                  position.totalVotes ??
                  candidates.reduce(
                    (sum, c) => sum + Number(c.voteCount || c.vote_count || 0),
                    0
                  );

                const maxVotes =
                  candidates.length > 0
                    ? Math.max(
                        ...candidates.map((c) =>
                          Number(c.voteCount || c.vote_count || 0)
                        )
                      )
                    : 0;

                const topCandidates = candidates.filter(
                  (c) =>
                    Number(c.voteCount || c.vote_count || 0) === maxVotes &&
                    maxVotes > 0
                );
                const isTie = topCandidates.length > 1;

                return (
                  <div
                    key={position.positionId || position.id}
                    className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs"
                  >
                    {/* Position Header */}
                    <div className="bg-gray-50/90 px-6 sm:px-8 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">
                            {position.positionName || position.name || "Position"}
                          </h3>

                          {isTie ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              ⚖️ Tie Detected ({topCandidates.length} Co-Leaders)
                            </span>
                          ) : position.winner || topCandidates.length === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={13} /> Winner Determined
                            </span>
                          ) : null}
                        </div>

                        {position.positionDescription && (
                          <p className="text-xs text-gray-500 mt-1">
                            {position.positionDescription}
                          </p>
                        )}
                      </div>

                      <div className="text-right sm:border-l sm:border-gray-200 sm:pl-6">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Total Position Votes
                        </span>
                        <p className="text-xl font-bold text-gray-900">
                          {totalPosVotes}{" "}
                          <span className="text-xs text-gray-500 font-normal">
                            votes
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Candidates Listing */}
                    <div className="divide-y divide-gray-100">
                      {candidates.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-400 italic">
                          No candidates nominated for this position.
                        </div>
                      ) : (
                        candidates.map((candidate, rankIdx) => {
                          const voteCount = Number(
                            candidate.voteCount || candidate.vote_count || 0
                          );
                          const isWinner =
                            !isTie && voteCount === maxVotes && maxVotes > 0;
                          const isTiedLeader =
                            isTie && voteCount === maxVotes && maxVotes > 0;

                          const percentage =
                            totalPosVotes > 0
                              ? ((voteCount / totalPosVotes) * 100).toFixed(1)
                              : "0.0";

                          const candidateName =
                            candidate.candidateName ||
                            candidate.full_name ||
                            candidate.name ||
                            "Candidate";

                          const studentCode =
                            candidate.studentCode ||
                            candidate.student_code ||
                            candidate.student_id ||
                            candidate.studentId;

                          const photoUrl =
                            candidate.photoUrl || candidate.photo_url;

                          return (
                            <div
                              key={
                                candidate.candidateId ||
                                candidate.id ||
                                rankIdx
                              }
                              className={`p-6 sm:p-7 transition ${
                                isWinner
                                  ? "bg-amber-50/40"
                                  : isTiedLeader
                                  ? "bg-yellow-50/30"
                                  : "hover:bg-gray-50/50"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                {/* Candidate Profile */}
                                <div className="flex items-center gap-4">
                                  {photoUrl ? (
                                    <img
                                      src={photoUrl}
                                      alt={candidateName}
                                      className={`w-14 h-14 rounded-2xl object-cover border-2 shadow-xs shrink-0 ${
                                        isWinner
                                          ? "border-amber-400"
                                          : "border-gray-200"
                                      }`}
                                    />
                                  ) : (
                                    <div
                                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-xs ${
                                        isWinner
                                          ? "bg-amber-400 text-white"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {candidateName.charAt(0).toUpperCase()}
                                    </div>
                                  )}

                                  <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                      <h4 className="text-lg font-bold text-gray-900">
                                        {candidateName}
                                      </h4>

                                      {isWinner && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                                          <Trophy
                                            size={13}
                                            className="text-amber-600 fill-amber-500"
                                          />
                                          WINNER
                                        </span>
                                      )}

                                      {isTiedLeader && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                          Co-Leader (Tie)
                                        </span>
                                      )}
                                    </div>

                                    {studentCode && (
                                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                                        Student ID: {studentCode}
                                      </p>
                                    )}

                                    {candidate.manifesto && (
                                      <p className="text-xs text-gray-600 italic mt-1 line-clamp-1 max-w-xl">
                                        &ldquo;{candidate.manifesto}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Vote Tally & Percentage */}
                                <div className="text-right shrink-0">
                                  <div className="flex items-baseline justify-end gap-1.5">
                                    <span className="text-2xl sm:text-3xl font-black text-gray-900">
                                      {voteCount}
                                    </span>
                                    <span className="text-xs text-gray-500 font-semibold uppercase">
                                      Votes
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-blue-700 mt-0.5">
                                    {percentage}% of position votes
                                  </p>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-4">
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                                      isWinner
                                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                        : isTiedLeader
                                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                        : "bg-gradient-to-r from-blue-500 to-indigo-600"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Confirmation Modal for Publishing Results */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => {
          if (!isPublishing) setIsPublishModalOpen(false);
        }}
        title="Publish Official Election Results"
        icon={<Award size={24} className="text-purple-600" />}
        confirmText={isPublishing ? "Publishing..." : "Yes, Publish Results"}
        confirmDisabled={isPublishing}
        confirmVariant="primary"
        onConfirm={handlePublishResults}
      >
        <p className="text-gray-600 text-sm leading-relaxed">
          Are you sure you want to publish these election results? Students will be able to view the official results.
        </p>
      </Modal>
    </div>
  );
}
