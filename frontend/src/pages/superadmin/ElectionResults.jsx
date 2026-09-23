import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  ArrowLeft,
  RefreshCw,
  Send,
  Award,
  Vote,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";
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
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchResultsData = useCallback(async (isManual = false) => {
    if (!electionId) return;
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const data = await getElectionResults(electionId);
      setElection(data.election || null);
      setStats(data.stats || null);
      setResults(data.results || data.data || []);
    } catch (err) {
      console.error("Super Admin Election Results Error:", err);
      toast.error("Failed to load election results.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [electionId]);

  useEffect(() => {
    fetchResultsData();
  }, [fetchResultsData]);

  const handlePublishResults = async () => {
    try {
      setIsPublishing(true);
      await updateElectionStatus(electionId, "RESULT_PUBLISHED");
      toast.success("Results published successfully!");
      setIsPublishModalOpen(false);
      fetchResultsData(true);
    } catch (err) {
      console.error("Publish results error:", err);
      toast.error(err.response?.data?.message || "Failed to publish results.");
    } finally {
      setIsPublishing(false);
    }
  };

  const isClosed = election?.status === "CLOSED";
  const isPublished = election?.status === "RESULT_PUBLISHED";

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/super-admin/results");
                }
              }}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {election?.title || "Election Results"}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Official vote tabulations and outcomes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchResultsData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>

            {isClosed && (
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Send size={15} />
                <span>Publish Results</span>
              </button>
            )}

            {isPublished && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-200">
                <Award size={14} className="text-purple-600" />
                Published
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Loading results tally...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                title="Total Ballots Cast"
                value={stats?.totalVotesCast ?? 0}
                icon={<Vote size={22} className="text-purple-600" />}
                color="purple"
              />
              <StatCard
                title="Eligible Voters"
                value={stats?.totalEligibleVoters ?? 0}
                icon={<Users size={22} className="text-indigo-600" />}
                color="indigo"
              />
              <StatCard
                title="Voter Turnout"
                value={
                  stats?.turnoutPercentage
                    ? String(stats.turnoutPercentage).endsWith("%")
                      ? stats.turnoutPercentage
                      : `${stats.turnoutPercentage}%`
                    : "0%"
                }
                icon={<Trophy size={22} className="text-emerald-600" />}
                color="green"
              />
              <StatCard
                title="Status"
                value={election?.status || "DRAFT"}
                icon={<Award size={22} className="text-purple-600" />}
                color="purple"
              />
            </div>

            {/* Position Breakdowns */}
            {results.length === 0 ? (
              <EmptyState
                icon={<Trophy size={32} />}
                title="No results data available"
                message="No votes or candidate data found for this election."
              />
            ) : (
              <div className="space-y-6">
                {results.map((pos, pIdx) => {
                  const posId = pos.positionId ?? pos.position_id ?? pos.id ?? `pos-${pIdx}`;
                  const posName =
                    pos.positionName ??
                    pos.position_name ??
                    pos.title ??
                    pos.name ??
                    `Position #${pIdx + 1}`;
                  const candidatesList = pos.candidates || [];
                  const totalPosVotes = Number(
                    pos.totalVotes ??
                      pos.total_votes ??
                      candidatesList.reduce(
                        (acc, c) => acc + Number(c.voteCount ?? c.vote_count ?? c.votes ?? 0),
                        0
                      )
                  );

                  let winnerCandidateId = pos.winner?.candidateId ?? null;
                  if (!winnerCandidateId) {
                    let maxVotes = -1;
                    candidatesList.forEach((c) => {
                      const count = Number(c.voteCount ?? c.vote_count ?? c.votes ?? 0);
                      if (count > maxVotes && count > 0) {
                        maxVotes = count;
                        winnerCandidateId = c.candidateId ?? c.candidate_id ?? c.id;
                      }
                    });
                  }

                  return (
                    <div
                      key={posId}
                      className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h2 className="text-base font-bold text-gray-900">
                          {posName}
                        </h2>
                        <span className="text-xs text-gray-500 font-medium">
                          Total Votes: <strong>{totalPosVotes}</strong>
                        </span>
                      </div>

                      <div className="space-y-3">
                        {candidatesList.length === 0 ? (
                          <p className="text-xs text-gray-400 py-3 text-center">
                            No candidates registered for this position.
                          </p>
                        ) : (
                          candidatesList.map((cand, idx) => {
                            const candId =
                              cand.candidateId ?? cand.candidate_id ?? cand.id ?? `cand-${idx}`;
                            const candName =
                              cand.candidateName ??
                              cand.candidate_name ??
                              cand.full_name ??
                              cand.name ??
                              "Candidate";
                            const rollNo =
                              cand.studentCode ?? cand.student_code ?? cand.student_id ?? "";
                            const votes = Number(
                              cand.voteCount ?? cand.vote_count ?? cand.votes ?? 0
                            );
                            const pct = cand.percentage
                              ? Math.round(parseFloat(cand.percentage))
                              : totalPosVotes > 0
                              ? Math.round((votes / totalPosVotes) * 100)
                              : 0;
                            const isWinner =
                              String(candId) === String(winnerCandidateId) && votes > 0;

                            return (
                              <div
                                key={candId}
                                className={`p-3.5 rounded-xl border transition ${
                                  isWinner
                                    ? "bg-purple-50/50 border-purple-200"
                                    : "bg-gray-50/50 border-gray-100"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {isWinner && (
                                      <Trophy size={16} className="text-purple-600" />
                                    )}
                                    <span className="text-xs font-bold text-gray-900">
                                      {candName}
                                    </span>
                                    {rollNo && (
                                      <span className="text-[10px] text-gray-400 font-mono">
                                        ({rollNo})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-900">
                                      {votes} votes
                                    </span>
                                    <span className="text-[11px] text-gray-500 font-mono">
                                      ({pct}%)
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isWinner ? "bg-purple-600" : "bg-indigo-400"
                                    }`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
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
            )}
          </>
        )}

        {/* Publish Results Confirmation Modal */}
        <Modal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          title="Publish Official Results"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Are you sure you want to publish official results for{" "}
              <strong>{election?.title}</strong>? Once published, results will be visible to all students and faculty.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublishResults}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isPublishing ? "Publishing..." : "Confirm & Publish"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </SuperAdminLayout>
  );
}
