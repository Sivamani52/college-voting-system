import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Award,
  Lock,
  Search,
  ChevronRight,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Users,
  Vote,
  Share2,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import EmptyState from "../../components/common/EmptyState";
import StatCard from "../../components/common/StatCard";
import Alert from "../../components/common/Alert";
import {
  getAllElections,
  getElectionResults,
  updateElectionStatus,
} from "../../services/electionService";

export default function SuperAdminResults() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedElectionId, setSelectedElectionId] = useState("");

  // Detailed Results State for Selected Election
  const [resultsData, setResultsData] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadElections = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await getAllElections();
      const list = res.elections || res.data || (Array.isArray(res) ? res : []);
      setElections(list);

      // Default select first result-ready election if not already set
      setSelectedElectionId((prevId) => {
        if (prevId) return prevId;
        if (list.length === 0) return "";
        const publishedOrClosed = list.find(
          (e) =>
            e.status === "RESULT_PUBLISHED" ||
            e.status === "CLOSED" ||
            e.status === "ACTIVE"
        );
        return publishedOrClosed ? String(publishedOrClosed.id) : String(list[0].id);
      });
    } catch (err) {
      console.error("Failed to load election results list:", err);
      toast.error("Failed to fetch elections list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  // Load results whenever selectedElectionId changes
  const loadResultsForElection = useCallback(async (electionId) => {
    if (!electionId) {
      setResultsData(null);
      return;
    }

    try {
      setResultsLoading(true);
      const data = await getElectionResults(electionId);
      setResultsData(data);
    } catch (err) {
      console.error("Fetch election results error:", err);
      setResultsData(null);
    } finally {
      setResultsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadResultsForElection(selectedElectionId);
    }
  }, [selectedElectionId, loadResultsForElection]);

  const handlePublishResults = async () => {
    if (!selectedElectionId) return;
    try {
      setPublishing(true);
      await updateElectionStatus(selectedElectionId, "RESULT_PUBLISHED");
      toast.success("Election results certified and published to students!");
      loadElections(true);
      loadResultsForElection(selectedElectionId);
    } catch (err) {
      console.error("Publish results error:", err);
      toast.error(err.response?.data?.message || "Failed to publish election results.");
    } finally {
      setPublishing(false);
    }
  };

  const resultsEligibleElections = elections;

  const selectedElectionObj = elections.find(
    (e) => String(e.id) === String(selectedElectionId)
  );

  const positionsResults =
    resultsData?.results || resultsData?.data || (Array.isArray(resultsData) ? resultsData : []);
  const stats = resultsData?.stats || {};

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-purple-700 to-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Election Results & Tabulations
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Official vote counts, candidate standings, and result publication
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadElections(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh Results"}</span>
          </button>
        </div>

        {/* Election Selector Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
          <label
            htmlFor="electionSelect"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700"
          >
            Select Election to View Certified Results:
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              id="electionSelect"
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="w-full sm:flex-1 px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              <option value="">-- Choose Election Session --</option>
              {resultsEligibleElections.map((el) => (
                <option key={el.id} value={String(el.id)}>
                  {el.title} [{el.status}]
                </option>
              ))}
            </select>

            {selectedElectionObj?.status === "CLOSED" && (
              <button
                type="button"
                onClick={handlePublishResults}
                disabled={publishing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Award size={15} />
                <span>{publishing ? "Publishing..." : "Certify & Publish Results"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Election Banner & Key Statistics */}
        {selectedElectionObj && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-purple-800/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedElectionObj.status === "RESULT_PUBLISHED"
                        ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                        : selectedElectionObj.status === "ACTIVE"
                        ? "bg-green-400/20 text-green-300 border border-green-400/30"
                        : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    }`}
                  >
                    {selectedElectionObj.status === "RESULT_PUBLISHED" && <Award size={11} />}
                    {selectedElectionObj.status === "ACTIVE" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    )}
                    <span>{selectedElectionObj.status}</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{selectedElectionObj.title}</h2>
                <p className="text-xs text-slate-300 mt-1">{selectedElectionObj.description}</p>
              </div>

              <Link
                to={`/super-admin/elections/${selectedElectionObj.id}/results`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 shrink-0"
              >
                <BarChart3 size={14} />
                <span>Full Tabulation View</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Position-Wise Results Breakdown */}
        {resultsLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-medium">Tabulating ballots...</p>
          </div>
        ) : !selectedElectionId ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
            <EmptyState
              icon={<Trophy size={32} />}
              title="No election selected"
              message="Choose an election session from the dropdown above to inspect certified vote tallies."
            />
          </div>
        ) : positionsResults.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
            <EmptyState
              icon={<Vote size={32} />}
              title="No votes recorded yet"
              message="Voting has not commenced or no ballots have been cast in this session."
            />
          </div>
        ) : (
          <div className="space-y-6">
            {positionsResults.map((position, pIdx) => {
              const posId =
                position.positionId ?? position.position_id ?? position.id ?? `pos-${pIdx}`;
              const posName =
                position.positionName ??
                position.position_name ??
                position.name ??
                `Position #${pIdx + 1}`;
              const candidatesList = position.candidates || [];
              const totalVotesForPos = Number(
                position.totalVotes ??
                  position.total_votes ??
                  candidatesList.reduce(
                    (acc, c) => acc + Number(c.voteCount ?? c.vote_count ?? c.votes ?? 0),
                    0
                  )
              );

              // Find winner (candidate with highest votes or backend position.winner)
              let maxVotes = -1;
              let winnerCandidateId = position.winner?.candidateId ?? null;
              if (!winnerCandidateId) {
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
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden"
                >
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50/70 via-slate-50/50 to-transparent border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900">
                        {posName}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {totalVotesForPos} Total Ballot(s) Cast for Position
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-xl">
                      {candidatesList.length} Candidate(s)
                    </span>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    {candidatesList.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center font-medium">
                        No candidates enrolled for this position.
                      </p>
                    ) : (
                      candidatesList.map((cand, cIdx) => {
                        const candId =
                          cand.candidateId ?? cand.candidate_id ?? cand.id ?? `cand-${cIdx}`;
                        const candName =
                          cand.candidateName ??
                          cand.candidate_name ??
                          cand.full_name ??
                          cand.name ??
                          "Candidate";
                        const rollNo =
                          cand.studentCode ?? cand.student_code ?? cand.student_id ?? "Candidate";
                        const count = Number(cand.voteCount ?? cand.vote_count ?? cand.votes ?? 0);
                        const pct = cand.percentage
                          ? Math.round(parseFloat(cand.percentage))
                          : totalVotesForPos > 0
                          ? Math.round((count / totalVotesForPos) * 100)
                          : 0;
                        const isWinner =
                          String(candId) === String(winnerCandidateId) &&
                          count > 0 &&
                          (selectedElectionObj?.status === "RESULT_PUBLISHED" ||
                            selectedElectionObj?.status === "CLOSED" ||
                            selectedElectionObj?.status === "ACTIVE");

                        return (
                          <div
                            key={candId}
                            className={`p-4 rounded-2xl border transition ${
                              isWinner
                                ? "bg-purple-50/50 border-purple-200"
                                : "bg-slate-50/60 border-gray-200/80"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                                  {candName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-gray-900">
                                      {candName}
                                    </span>
                                    {isWinner && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-200">
                                        <Trophy size={11} className="text-amber-600" /> Leading / Winner
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono text-[11px] text-gray-400">
                                    Roll: {rollNo}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-base font-black text-gray-900">{count} Votes</p>
                                <p className="text-[11px] font-semibold text-gray-400">{pct}%</p>
                              </div>
                            </div>

                            {/* Vote Progress Bar */}
                            <div className="w-full bg-gray-200/70 h-2.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isWinner
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                                    : "bg-blue-600"
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
      </div>
    </SuperAdminLayout>
  );
}
