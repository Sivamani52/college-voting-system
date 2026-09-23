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
  Trophy,
  UserPlus,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import { getMyAdminProfile, getAllStudents } from "../../services/studentService";
import { getAllElections } from "../../services/electionService";
import { ElectionStatusBadge } from "../../components/student/ElectionCard";

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

  // Section Error States
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

  // Recent / Sorted Elections
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
      return priorityA - priorityB;
    });
  }, [elections]);

  const isLoading = loadingProfile || loadingStudents || loadingElections;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Errors if any */}
        {profileError && <Alert type="error" message={profileError} onDismiss={() => setProfileError(null)} />}
        {studentsError && <Alert type="error" message={studentsError} onDismiss={() => setStudentsError(null)} />}
        {electionsError && <Alert type="error" message={electionsError} onDismiss={() => setElectionsError(null)} />}

        {/* Highlight Hero Dashboard Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <ShieldCheck size={14} className="text-blue-400" />
                  College Administrator Console
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/15">
                  Dept ID: {adminProfile?.department_id ?? "All"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/15">
                  Year: {adminProfile?.year_id ?? 1} • Sec: {adminProfile?.section_id ?? "A"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Welcome back,{" "}
                <span className="text-blue-400">
                  {adminProfile?.full_name || user?.name || "Administrator"}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Centralized authority over departmental elections, registered student voter lists, and candidate nomination approvals for your academic class.
              </p>

              <div className="pt-1 flex items-center gap-2 flex-wrap text-xs text-blue-200">
                <span className="bg-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Building2 size={13} className="text-blue-300" />
                  <span>{adminProfile?.department_name || `Department #${adminProfile?.department_id || 1}`}</span>
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Mail size={13} className="text-blue-300" />
                  <span>{user?.email}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-row sm:flex-col gap-2.5 shrink-0">
              <Link
                to="/admin/elections"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xs transition"
              >
                <PlusCircle size={16} />
                <span>Create Election</span>
              </Link>

              <Link
                to="/admin/students"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 active:scale-98 text-white font-bold text-xs transition border border-white/20"
              >
                <Users size={16} className="text-blue-300" />
                <span>Students ({students.length})</span>
              </Link>

              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={isRefreshing || isLoading}
                className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-400" : ""} />
                <span>{isRefreshing ? "Refreshing..." : "Sync Data"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Administrator Quickstart & Onboarding Guide */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Sparkles size={16} />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                Administrator Workflow Checklist
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Department Coordinator
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Verify Class Roster</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Ensure all student voters in your class are registered with valid college IDs and emails.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Setup Election & Positions</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Establish election timelines, define council positions, and assign candidate profiles.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Track & Publish Results</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Monitor live participation tallies, close polls when concluded, and release certified results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <StatCard
            title="Total Students"
            value={loadingStudents ? "..." : studentStats.total}
            icon={<Users size={22} />}
            description="Enrolled in assigned class"
          />
          <StatCard
            title="Active Voters"
            value={loadingStudents ? "..." : studentStats.active}
            icon={<UserCheck size={22} className="text-emerald-600" />}
            description="Verified student voters"
          />
          <StatCard
            title="Live Elections"
            value={loadingElections ? "..." : electionStats.active}
            icon={<Vote size={22} className="text-green-600" />}
            description="Currently accepting votes"
          />
          <StatCard
            title="Published Results"
            value={loadingElections ? "..." : electionStats.resultPublished}
            icon={<Trophy size={22} className="text-purple-600" />}
            description="Final election outcomes"
          />
        </div>

        {/* Elections Overview Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60 shadow-2xs">
                <Vote size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Recent Elections & Status
                </h3>
                <p className="text-xs text-gray-500">
                  Overview of college and departmental election events
                </p>
              </div>
            </div>

            <Link
              to="/admin/elections"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition"
            >
              <span>View All Elections</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {loadingElections ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-medium text-gray-500">Loading elections overview...</p>
            </div>
          ) : recentElections.length === 0 ? (
            <div className="p-8 sm:p-12">
              <EmptyState
                icon={<Vote size={32} />}
                title="No elections created yet"
                message="Create your first departmental election to start accepting candidate nominations and votes."
                action={
                  <Link
                    to="/admin/elections"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-blue-700 transition"
                  >
                    <PlusCircle size={16} />
                    <span>Create New Election</span>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">Election Title</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6">Status</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 hidden md:table-cell">Start Date</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 hidden md:table-cell">End Date</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {recentElections.slice(0, 5).map((el) => (
                    <tr key={el.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-gray-900">
                        <div className="max-w-xs truncate">{el.title}</div>
                        {el.description && (
                          <div className="text-xs text-gray-400 font-normal truncate max-w-xs mt-0.5">
                            {el.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <ElectionStatusBadge status={el.status} />
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-600 hidden md:table-cell">
                        {el.start_date ? new Date(el.start_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-600 hidden md:table-cell">
                        {el.end_date ? new Date(el.end_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {el.status === "RESULT_PUBLISHED" ? (
                            <Link
                              to={`/admin/results/${el.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition"
                            >
                              <Trophy size={13} />
                              <span>Results</span>
                            </Link>
                          ) : (
                            <Link
                              to="/admin/elections"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition"
                            >
                              <span>Manage</span>
                              <ArrowRight size={13} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links / Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/admin/students"
            className="p-5 rounded-2xl sm:rounded-3xl bg-white border border-gray-200/80 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  Student Management
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add, search, and verify class students roster
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/profile"
            className="p-5 rounded-2xl sm:rounded-3xl bg-white border border-gray-200/80 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  Profile & Security
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update admin credentials and password
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}