import { useEffect, useState, useCallback, useMemo } from "react";
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
  Medal,
  Award,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/common/Navbar";
import { getElectionResults } from "../../services/voteService";
import api from "../../services/api";

export default function Results() {
  const params = useParams();
  const electionId = params.electionId || params.id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [election, setElection] = useState(null);
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Determine back navigation based on user role
  const backNav = useMemo(() => {
    if (user?.role === "ADMIN") {
      return {
        path: "/admin/elections",
        label: "Back to Elections",
        dashboardPath: "/admin",
      };
    }
    if (user?.role === "SUPER_ADMIN") {
      return {
        path: "/superadmin",
        label: "Back to Super Admin",
        dashboardPath: "/superadmin",
      };
    }
    return {
      path: "/student",
      label: "Back to Dashboard",
      dashboardPath: "/student",
    };
  }, [user?.role]);

  const fetchResults = useCallback(async (isRefresh = false) => {
    if (!electionId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      let data;
      try {
        data = await getElectionResults(electionId);
      } catch {
        // Fallback directly to api endpoint
        const response = await api.get(`/results/${electionId}`);
        data = response.data;
      }

      setElection(data.election || null);
      setStats(data.stats || null);
      setResults(data.results || data.data || []);
    } catch (err) {
      console.error("Results load error:", err);
      const message =
        err.response?.data?.message ||
        "Failed to load election results. The results may not have been published yet.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [electionId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar subtitle="Official Election Results" />
        <div className="max-w-md mx-auto my-auto p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Loading Results...</h2>
          <p className="text-gray-500 text-sm mt-1">
            Tabulating verified ballots and election statistics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar subtitle="Official Election Results" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            to={backNav.path}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            <span>{backNav.label}</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchResults(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium rounded-xl hover:bg-gray-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin text-purple-600" : ""}
              />
              <span>{refreshing ? "Updating..." : "Refresh Results"}</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-12 text-center shadow-xs max-w-2xl mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Results Currently Unavailable
            </h2>

            <p className="text-gray-600 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              {error}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => fetchResults(false)}
                className="px-4 sm:px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer"
              >
                Try Again
              </button>
              <Link
                to={backNav.path}
                className="px-4 sm:px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs sm:text-sm rounded-xl transition"
              >
                {backNav.label}
              </Link>
            </div>
          </div>
        )}

        {/* Results Content */}
        {!error && (
          <>
            {/* Header Hero */}
            <div className="bg-gradient-to-br from-purple-950 via-indigo-900 to-purple-900 text-white rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2.5 backdrop-blur-xs">
                    <Trophy size={13} className="text-amber-400" />
                    <span>Official Certified Results</span>
                  </div>

                  <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                    {election?.title || "Election Results"}
                  </h1>

                  <p className="text-purple-200 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                    {election?.description ||
                      "Final vote count and winner declarations for all contested positions."}
                  </p>
                </div>

                <div className="shrink-0 bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 text-xs text-purple-100 space-y-1.5 self-start md:self-auto">
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-amber-300" />
                    <span className="font-semibold text-white">
                      Status: Published
                    </span>
                  </div>
                  {election?.endDate && (
                    <div className="flex items-center gap-2 text-purple-200 text-[11px] sm:text-xs">
                      <Calendar size={13} />
                      <span>
                        Concluded:{" "}
                        {new Date(election.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Turnout Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Votes Cast */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Vote size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                      Total Ballots
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                      {stats.totalVotesCast?.toLocaleString() ?? 0}
                    </p>
                  </div>
                </div>

                {/* Voters Participated */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                      Voters Voted
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                      {stats.uniqueVotersParticipated?.toLocaleString() ?? 0}
                    </p>
                  </div>
                </div>

                {/* Turnout Rate */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                      Turnout Rate
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                      {stats.turnoutPercentage || "0%"}
                    </p>
                  </div>
                </div>

                {/* Eligible Roster */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Medal size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                      Eligible Voters
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                      {stats.totalEligibleVoters?.toLocaleString() ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Results Fallback */}
            {results.length === 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs">
                <BarChart3 size={44} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  No Position Results Found
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  There are no tabulated candidate results recorded for this election.
                </p>
              </div>
            )}

            {/* Positions and Candidates Results */}
            <div className="space-y-6 sm:space-y-8">
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
                    <div className="bg-gray-50/90 px-5 sm:px-8 py-4 sm:py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-lg sm:text-xl font-black text-gray-900">
                            {position.positionName || position.name || "Position"}
                          </h2>
                          {isTie ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              ⚖️ Tie for 1st Place
                            </span>
                          ) : position.winner || topCandidates.length === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={13} /> Winner Declared
                            </span>
                          ) : null}
                        </div>

                        {position.positionDescription && (
                          <p className="text-xs text-gray-500 mt-1">
                            {position.positionDescription}
                          </p>
                        )}
                      </div>

                      <div className="sm:text-right sm:border-l sm:border-gray-200 sm:pl-6">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Position Ballots
                        </span>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                          {totalPosVotes}{" "}
                          <span className="text-xs text-gray-500 font-normal">
                            vote(s)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Candidate Breakdown */}
                    <div className="divide-y divide-gray-100">
                      {candidates.length === 0 ? (
                        <div className="p-8 text-center text-xs sm:text-sm text-gray-400 italic">
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
                              className={`p-4 sm:p-6 transition ${
                                isWinner
                                  ? "bg-amber-50/40"
                                  : isTiedLeader
                                  ? "bg-yellow-50/30"
                                  : "hover:bg-gray-50/50"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                {/* Candidate Profile */}
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                  {photoUrl ? (
                                    <img
                                      src={photoUrl}
                                      alt={candidateName}
                                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 shadow-2xs shrink-0 ${
                                        isWinner
                                          ? "border-amber-400"
                                          : "border-gray-200"
                                      }`}
                                    />
                                  ) : (
                                    <div
                                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-base sm:text-lg shrink-0 shadow-2xs ${
                                        isWinner
                                          ? "bg-amber-400 text-white"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {candidateName.charAt(0).toUpperCase()}
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                        {candidateName}
                                      </h3>

                                      {isWinner && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                          <Trophy
                                            size={12}
                                            className="text-amber-600 fill-amber-500"
                                          />
                                          WINNER
                                        </span>
                                      )}

                                      {isTiedLeader && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                          Co-Leader (Tie)
                                        </span>
                                      )}
                                    </div>

                                    {studentCode && (
                                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                                        ID: {studentCode}
                                      </p>
                                    )}

                                    {candidate.manifesto && (
                                      <p className="text-xs text-gray-600 italic mt-0.5 line-clamp-1 max-w-xl">
                                        &ldquo;{candidate.manifesto}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Vote Number & Percentage */}
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 pt-2 sm:pt-0 shrink-0">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xl sm:text-2xl font-black text-gray-900">
                                      {voteCount}
                                    </span>
                                    <span className="text-[11px] text-gray-500 font-semibold uppercase">
                                      Votes
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-purple-700">
                                    {percentage}% of votes
                                  </p>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
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
    </div>
  );
}