import { useState, useEffect } from "react";
import { Vote, Clock, CheckCircle, User } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  getMyProfile,
  getMyElections,
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

      setElections(
        electionData.elections ||
        electionData.data ||
        electionData ||
        []
      );
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

  const completedElections = elections.filter(
    (election) =>
      election.status === "CLOSED" ||
      election.status === "RESULT_PUBLISHED"
  );

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
        {/* Welcome Banner */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {profile?.full_name || "Student"} 👋
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            View your elections and cast your vote securely.
          </p>
        </div>

        {/* Error */}
        {error && <Alert type="error" message={error} />}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Available Elections"
            value={activeElections.length}
            icon={<Vote size={22} />}
          />
          <StatCard
            title="Upcoming"
            value={upcomingElections.length}
            icon={<Clock size={22} />}
          />
          <StatCard
            title="Completed"
            value={completedElections.length}
            icon={<CheckCircle size={22} />}
          />
          <StatCard
            title="My Profile"
            value="Active"
            icon={<User size={22} />}
          />
        </div>

        {/* Profile Information */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  My Information
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your registered college academic profile
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400">
                <User size={20} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
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

        {/* Active Elections */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-900">
              Active Elections
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Elections you can currently participate in
            </p>
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
      </main>
    </div>
  );
}