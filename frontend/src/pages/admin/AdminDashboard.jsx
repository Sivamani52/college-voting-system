import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Vote,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Mail,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import { getMyAdminProfile, getAllStudents } from "../../services/studentService";
import { getAllElections } from "../../services/electionService";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Data States
  const [adminProfile, setAdminProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [elections, setElections] = useState([]);

  // Section Loading States
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingElections, setLoadingElections] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Section Error States (Isolated to prevent full-dashboard crash)
  const [profileError, setProfileError] = useState(null);
  const [studentsError, setStudentsError] = useState(null);
  const [electionsError, setElectionsError] = useState(null);

  // Fetch Admin Profile
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const res = await getMyAdminProfile();
      setAdminProfile(res?.admin || res);
    } catch (err) {
      setProfileError(
        err?.response?.data?.message || "Failed to load admin profile information."
      );
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Fetch Students
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    setStudentsError(null);
    try {
      const res = await getAllStudents();
      const list = Array.isArray(res) ? res : res?.students || [];
      setStudents(list);
    } catch (err) {
      setStudentsError(
        err?.response?.data?.message || "Failed to load student statistics."
      );
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Fetch Elections
  const fetchElections = useCallback(async () => {
    setLoadingElections(true);
    setElectionsError(null);
    try {
      const res = await getAllElections();
      const list = Array.isArray(res) ? res : res?.elections || [];
      setElections(list);
    } catch (err) {
      setElectionsError(
        err?.response?.data?.message || "Failed to load election overview."
      );
    } finally {
      setLoadingElections(false);
    }
  }, []);

  // Combined Refresh
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([fetchProfile(), fetchStudents(), fetchElections()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchProfile();
    fetchStudents();
    fetchElections();
  }, [fetchProfile, fetchStudents, fetchElections]);

  // Derived Student Statistics
  const studentStats = useMemo(() => {
    const total = students.length;
    const active = students.filter(
      (s) => (s.status || s.user_status || "").toUpperCase() === "ACTIVE"
    ).length;
    const inactive = students.filter(
      (s) => (s.status || s.user_status || "").toUpperCase() === "INACTIVE"
    ).length;
    return { total, active, inactive };
  }, [students]);

  // Derived Election Statistics
  const electionStats = useMemo(() => {
    const total = elections.length;
    const draft = elections.filter((e) => (e.status || "").toUpperCase() === "DRAFT").length;
    const upcoming = elections.filter((e) => (e.status || "").toUpperCase() === "UPCOMING").length;
    const active = elections.filter((e) => (e.status || "").toUpperCase() === "ACTIVE").length;
    const closed = elections.filter((e) => (e.status || "").toUpperCase() === "CLOSED").length;
    const resultPublished = elections.filter(
      (e) => (e.status || "").toUpperCase() === "RESULT_PUBLISHED"
    ).length;
    return { total, draft, upcoming, active, closed, resultPublished };
  }, [elections]);

  // Recent / Sorted Elections (Active/Upcoming first, then by date)
  const recentElections = useMemo(() => {
    const statusPriority = {
      ACTIVE: 1,
      UPCOMING: 2,
      RESULT_PUBLISHED: 3,
      CLOSED: 4,
      DRAFT: 5,
    };

    return [...elections].sort((a, b) => {
      const priorityA = statusPriority[(a.status || "").toUpperCase()] || 99;
      const priorityB = statusPriority[(b.status || "").toUpperCase()] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;

      const dateA = new Date(a.start_date || a.created_at || 0).getTime();
      const dateB = new Date(b.start_date || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [elections]);

  // Date Formatter Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return String(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateString);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (rawStatus) => {
    const status = (rawStatus || "DRAFT").toUpperCase();
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} className="text-blue-500" />
            Upcoming
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <CheckCircle2 size={12} className="text-gray-500" />
            Closed
          </span>
        );
      case "RESULT_PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <BarChart3 size={12} className="text-purple-600" />
            Result Published
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FileText size={12} className="text-amber-600" />
            Draft
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                <ShieldCheck size={12} /> Admin Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1.5">
              Welcome back,{" "}
              <span className="text-blue-600">
                {adminProfile?.full_name || user?.name || user?.email?.split("@")[0] || "Administrator"}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Here is what is happening with your assigned class and campus elections today.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing || loadingProfile || loadingStudents || loadingElections}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs disabled:opacity-50 self-start sm:self-auto cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin text-blue-600" : "text-gray-500"}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* 1. ADMIN PROFILE & CLASS SCOPE CARD */}
        <section aria-labelledby="admin-profile-heading">
          {profileError ? (
            <Alert
              type="error"
              message={profileError}
              onDismiss={() => setProfileError(null)}
            />
          ) : loadingProfile ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 shadow-xs p-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                {/* Profile Avatar & Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-md shadow-blue-500/20 uppercase">
                    {(adminProfile?.full_name || user?.email || "A").charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        id="admin-profile-heading"
                        className="text-lg font-bold text-gray-900"
                      >
                        {adminProfile?.full_name || "Administrator"}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                        {adminProfile?.role || user?.role || "ADMIN"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Mail size={14} className="text-gray-400" />
                      <span>{adminProfile?.email || user?.email || "Not specified"}</span>
                    </p>
                  </div>
                </div>

                {/* Assigned Department / Year / Section Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-gray-200/80">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 font-medium border border-gray-200">
                    <Building2 size={14} className="text-blue-600" />
                    <span>Department:</span>
                    <strong className="text-gray-900 font-bold">
                      {adminProfile?.department_id !== undefined && adminProfile?.department_id !== null
                        ? `ID #${adminProfile.department_id}`
                        : "N/A"}
                    </strong>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 font-medium border border-gray-200">
                    <Calendar size={14} className="text-emerald-600" />
                    <span>Year:</span>
                    <strong className="text-gray-900 font-bold">
                      {adminProfile?.year_id !== undefined && adminProfile?.year_id !== null
                        ? `ID #${adminProfile.year_id}`
                        : "N/A"}
                    </strong>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 font-medium border border-gray-200">
                    <Layers size={14} className="text-purple-600" />
                    <span>Section:</span>
                    <strong className="text-gray-900 font-bold">
                      {adminProfile?.section_id !== undefined && adminProfile?.section_id !== null
                        ? `ID #${adminProfile.section_id}`
                        : "N/A"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. QUICK ACTIONS SECTION */}
        <section aria-labelledby="quick-actions-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="quick-actions-heading"
              className="text-xs font-bold uppercase tracking-wider text-gray-500"
            >
              Quick Navigation & Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Manage Students Action */}
            <Link
              to="/admin/students"
              className="group p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all shadow-xs hover:shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition">
                    Manage Students
                  </h3>
                  <p className="text-xs text-gray-500">
                    View class roster & register students
                  </p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition"
              />
            </Link>

            {/* Manage Elections Action */}
            <Link
              to="/admin/elections"
              className="group p-4 bg-white hover:bg-purple-50/50 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all shadow-xs hover:shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition">
                  <Vote size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition">
                    Manage Elections
                  </h3>
                  <p className="text-xs text-gray-500">
                    Oversee elections & candidate lists
                  </p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition"
              />
            </Link>

            {/* Admin Profile Action */}
            <Link
              to="/admin/profile"
              className="group p-4 bg-white hover:bg-gray-100/70 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs hover:shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-gray-800 group-hover:text-white transition">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-800 transition">
                    My Account Profile
                  </h3>
                  <p className="text-xs text-gray-500">
                    View administrator account credentials
                  </p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-800 group-hover:translate-x-0.5 transition"
              />
            </Link>
          </div>
        </section>

        {/* 3. STUDENT STATISTICS */}
        <section aria-labelledby="student-stats-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="student-stats-heading"
              className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"
            >
              <GraduationCap size={16} className="text-blue-600" />
              Class Student Statistics
            </h2>
            <Link
              to="/admin/students"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {studentsError ? (
            <Alert
              type="error"
              message={studentsError}
              onDismiss={() => setStudentsError(null)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Total Students"
                value={loadingStudents ? "..." : studentStats.total}
                icon={<Users size={22} className="text-blue-600" />}
              />
              <StatCard
                title="Active Students"
                value={loadingStudents ? "..." : studentStats.active}
                icon={<UserCheck size={22} className="text-emerald-600" />}
              />
              <StatCard
                title="Inactive Students"
                value={loadingStudents ? "..." : studentStats.inactive}
                icon={<UserX size={22} className="text-amber-600" />}
              />
            </div>
          )}
        </section>

        {/* 4. ELECTION OVERVIEW */}
        <section aria-labelledby="election-overview-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="election-overview-heading"
              className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"
            >
              <Vote size={16} className="text-purple-600" />
              Election Overview
            </h2>
          </div>

          {electionsError ? (
            <Alert
              type="error"
              message={electionsError}
              onDismiss={() => setElectionsError(null)}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Total */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 text-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Total
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingElections ? "..." : electionStats.total}
                </p>
              </div>

              {/* Draft */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 text-center">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                  Draft
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingElections ? "..." : electionStats.draft}
                </p>
              </div>

              {/* Upcoming */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 text-center">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Upcoming
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingElections ? "..." : electionStats.upcoming}
                </p>
              </div>

              {/* Active */}
              <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs p-4 text-center">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Active
                </span>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {loadingElections ? "..." : electionStats.active}
                </p>
              </div>

              {/* Closed */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 text-center">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                  Closed
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingElections ? "..." : electionStats.closed}
                </p>
              </div>

              {/* Result Published */}
              <div className="bg-white rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs p-4 text-center">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block truncate">
                  Published
                </span>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {loadingElections ? "..." : electionStats.resultPublished}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 5. RECENT / UPCOMING ELECTIONS LIST */}
        <section aria-labelledby="recent-elections-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="recent-elections-heading"
              className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"
            >
              <Clock size={16} className="text-blue-600" />
              Available Campus Elections
            </h2>
            <Link
              to="/admin/elections"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {loadingElections ? (
              <div className="p-8 text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 animate-spin">
                  <RefreshCw size={22} />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  Loading election records...
                </p>
              </div>
            ) : recentElections.length === 0 ? (
              <div className="p-8 sm:p-10">
                <EmptyState
                  icon={<Vote size={32} />}
                  title="No elections available"
                  message="There are currently no elections created in the system."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        Election Title
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        Start Date
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        End Date
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6 text-right sm:text-left">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {recentElections.slice(0, 5).map((election) => (
                      <tr
                        key={election.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        {/* Title & Description */}
                        <td className="py-4 px-4 sm:px-6">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {election.title}
                            </p>
                            {election.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-md">
                                {election.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Start Date */}
                        <td className="py-4 px-4 sm:px-6 text-xs text-gray-600 whitespace-nowrap">
                          {formatDate(election.start_date)}
                        </td>

                        {/* End Date */}
                        <td className="py-4 px-4 sm:px-6 text-xs text-gray-600 whitespace-nowrap">
                          {formatDate(election.end_date)}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 sm:px-6 text-right sm:text-left whitespace-nowrap">
                          {renderStatusBadge(election.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Table Footer */}
                {recentElections.length > 5 && (
                  <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <Link
                      to="/admin/elections"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      Showing top 5 of {recentElections.length} elections — View All →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}