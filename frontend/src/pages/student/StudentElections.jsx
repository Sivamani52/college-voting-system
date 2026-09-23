import { useState, useEffect } from "react";
import { Vote, Search, Filter, RefreshCw, Trophy, Clock, CheckCircle } from "lucide-react";
import { getMyElections, getMyVotes } from "../../services/studentService";
import Navbar from "../../components/common/Navbar";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import ElectionCard from "../../components/student/ElectionCard";

export default function StudentElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadElections = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const electionData = await getMyElections();
      const rawElections =
        electionData.elections ||
        electionData.data ||
        electionData ||
        [];

      const enrichedElections = await Promise.all(
        rawElections.map(async (el) => {
          try {
            const voteRes = await getMyVotes(el.id);
            const votes = voteRes.votes || voteRes.data || voteRes || [];
            return {
              ...el,
              hasVoted: votes.length > 0,
              myVotes: votes,
            };
          } catch {
            return {
              ...el,
              hasVoted: false,
              myVotes: [],
            };
          }
        })
      );

      setElections(enrichedElections);
    } catch (err) {
      console.error("Fetch student elections error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load available elections."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  const activeCount = elections.filter((e) => e.status === "ACTIVE").length;
  const upcomingCount = elections.filter((e) => e.status === "UPCOMING").length;
  const publishedCount = elections.filter((e) => e.status === "RESULT_PUBLISHED").length;

  const filteredElections = elections.filter((e) => {
    const matchesSearch =
      (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "COMPLETED"
        ? e.status === "CLOSED" || e.status === "RESULT_PUBLISHED"
        : e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-12">
      <Navbar subtitle="Student Portal" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
              <Vote size={26} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Institutional Elections
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Browse official collegiate voting events, cast your ballot, and view published tallies
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadElections(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh Elections"}</span>
          </button>
        </div>

        {error && (
          <Alert type="error" message={error} onDismiss={() => setError("")} />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Elections"
            value={loading ? "..." : elections.length}
            icon={<Vote size={22} className="text-blue-600" />}
            description="All eligible ballot events"
          />
          <StatCard
            title="Live Elections"
            value={loading ? "..." : activeCount}
            icon={<CheckCircle size={22} className="text-green-600" />}
            description="Accepting votes now"
          />
          <StatCard
            title="Upcoming"
            value={loading ? "..." : upcomingCount}
            icon={<Clock size={22} className="text-amber-500" />}
            description="Scheduled sessions"
          />
          <StatCard
            title="Published Results"
            value={loading ? "..." : publishedCount}
            icon={<Trophy size={22} className="text-purple-600" />}
            description="Official outcomes certified"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search elections by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0">
              <Filter size={14} /> Filter:
            </span>
            {["ALL", "ACTIVE", "UPCOMING", "COMPLETED"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                }`}
              >
                {status === "ALL"
                  ? "All"
                  : status === "ACTIVE"
                  ? "Live"
                  : status === "UPCOMING"
                  ? "Upcoming"
                  : "Completed"}
              </button>
            ))}
          </div>
        </div>

        {/* Elections Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-medium">Loading elections...</p>
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
            <EmptyState
              icon={<Vote size={32} />}
              title="No elections match your filter"
              message="Check back soon for upcoming campus elections or clear your search filters."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
