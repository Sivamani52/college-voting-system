import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Vote, Clock, CheckCircle, User, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  getMyProfile,
  getMyElections,
  getMyVotes,
} from "../../services/studentService";
import Navbar from "../../components/common/Navbar";
import StatCard from "../../components/common/StatCard";
import InfoItem from "../../components/common/InfoItem";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import ElectionCard from "../../components/student/ElectionCard";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [elections, setElections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const [profileData, electionData] = await Promise.all([
        getMyProfile(),
        getMyElections(),
      ]);

      setProfile(
        profileData.student ||
        profileData.data ||
        profileData
      );

      const rawElections =
        electionData.elections ||
        electionData.data ||
        electionData ||
        [];

      // Check student votes for elections in parallel to show voted checkmarks
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
      console.error("Student dashboard error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const activeElections = elections.filter(
    (election) => election.status === "ACTIVE"
  );

  const upcomingElections = elections.filter(
    (election) => election.status === "UPCOMING"
  );

  const publishedElections = elections.filter(
    (election) => election.status === "RESULT_PUBLISHED"
  );

  const closedElections = elections.filter(
    (election) => election.status === "CLOSED"
  );

  const completedCount = publishedElections.length + closedElections.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Navbar */}
      <Navbar subtitle="Student Portal" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Highlight Hero Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-blue-600/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Verified Student Voter
                </span>
                {profile?.department_name && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-blue-100 border border-white/15">
                    {profile.department_name}
                  </span>
                )}
                {profile?.student_id && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/10 text-indigo-100 border border-white/15">
                    ID: {profile.student_id}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Welcome, {profile?.full_name || user?.name || "Student"} 👋
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
                Your official collegiate voting console. Explore certified candidate profiles, cast your single-transaction secure ballot, and monitor certified election results.
              </p>

              {/* Scope Academic Pills on Mobile & Desktop */}
              {profile && (
                <div className="pt-1 flex items-center gap-2 flex-wrap text-xs text-blue-200">
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">
                    Year: <strong>{profile.year_name || profile.year_id || 1}</strong>
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">
                    Section: <strong>{profile.section_name || profile.section_id || "A"}</strong>
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">
                    Status: <strong className="text-emerald-300">Active</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Hero Quick Actions */}
            <div className="flex flex-row sm:flex-col gap-2.5 shrink-0">
              {activeElections.length > 0 ? (
                <a
                  href="#active-elections"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-800 hover:bg-blue-50 active:scale-98 font-bold text-xs sm:text-sm transition shadow-sm"
                >
                  <Vote size={18} className="text-blue-600" />
                  <span>Vote Now ({activeElections.length})</span>
                </a>
              ) : null}

              {publishedElections.length > 0 ? (
                <Link
                  to="/student/elections?status=RESULT_PUBLISHED"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 active:scale-98 text-white font-bold text-xs transition border border-white/20"
                >
                  <Trophy size={16} className="text-amber-300" />
                  <span>View Results ({publishedElections.length})</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {/* First Login / Voting Walkthrough Onboarding Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-blue-100 p-4 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Sparkles size={16} />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                How Voting Works — Quick Voter Guide
              </h2>
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
              Safe & Anonymous
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Check Eligibility</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Your academic department and class determine which ballots you are authorized to cast.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Choose Candidates</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Review manifestos and select candidate nominees for each assigned leadership position.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Submit Atomic Ballot</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Your votes are permanently recorded in a single cryptographic database transaction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <Alert type="error" message={error} />}

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <StatCard
            title="Available Elections"
            value={activeElections.length}
            icon={<Vote size={22} />}
          />
          <StatCard
            title="Results Published"
            value={publishedElections.length}
            icon={<Trophy size={22} />}
          />
          <StatCard
            title="Upcoming"
            value={upcomingElections.length}
            icon={<Clock size={22} />}
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={<CheckCircle size={22} />}
          />
        </div>

        {/* Profile Information */}
        {profile && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-2xs p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Academic Profile Roster
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your registered college academic voter identity
                </p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <User size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
              <InfoItem
                label="Student ID"
                value={profile.student_id}
              />
              <InfoItem
                label="Email"
                value={user?.email || profile.email}
              />
              <InfoItem
                label="Phone"
                value={profile.phone || "Not provided"}
              />
              <InfoItem
                label="Department"
                value={
                  profile.department_name ||
                  profile.department_id ||
                  "N/A"
                }
              />
              <InfoItem
                label="Year"
                value={
                  profile.year_name ||
                  profile.year_id ||
                  "N/A"
                }
              />
              <InfoItem
                label="Section"
                value={
                  profile.section_name ||
                  profile.section_id ||
                  "N/A"
                }
              />
            </div>
          </div>
        )}

        {/* Published Results Section */}
        {publishedElections.length > 0 && (
          <section className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="text-purple-600" size={24} />
                  <h3 className="text-xl font-black text-gray-900">
                    Published Election Results
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Official certified results are available for review
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-200">
                {publishedElections.length} Published
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {publishedElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active Elections */}
        <section id="active-elections" className="scroll-mt-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Active Elections
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Elections you can currently participate in
              </p>
            </div>
            {activeElections.length > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                {activeElections.length} Live
              </span>
            )}
          </div>

          {activeElections.length === 0 ? (
            <EmptyState
              icon={<Vote size={28} />}
              title="No active elections"
              message="There are currently no active elections open for voting."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Elections */}
        {upcomingElections.length > 0 && (
          <section>
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                Upcoming Elections
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Elections scheduled to open soon
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                />
              ))}
            </div>
          </section>
        )}

        {/* Closed Elections (not yet published) */}
        {closedElections.length > 0 && (
          <section>
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                Closed Elections
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Voting has concluded. Results awaiting publication by administrators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {closedElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}