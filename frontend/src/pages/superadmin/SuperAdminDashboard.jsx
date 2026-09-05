import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Vote,
  Trophy,
  Clock,
  CheckCircle2,
  Lock,
  Award,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Users,
  UserCheck,
  PlusCircle,
  Search,
  Plus,
  Building,
  Mail,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/common/Navbar";
import StatCard from "../../components/common/StatCard";
import Alert from "../../components/common/Alert";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import {
  getAllElections,
  updateElectionStatus,
  createElection,
  getAllAdmins,
  createAdmin,
  getAllStudents,
  createStudent,
} from "../../services/electionService";

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  // Active Tab: 'elections' | 'admins' | 'students'
  const [activeTab, setActiveTab] = useState("elections");

  // Data states
  const [elections, setElections] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters & Search
  const [electionFilter, setElectionFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateElectionOpen, setIsCreateElectionOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);

  // Status Change Modal State
  const [selectedElection, setSelectedElection] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    departmentId: "1",
    yearId: "",
    sectionId: "",
  });

  const [studentForm, setStudentForm] = useState({
    studentId: "",
    fullName: "",
    email: "",
    departmentId: "1",
    yearId: "1",
    sectionId: "1",
    phone: "",
  });

  // Load all dashboard data
  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const [electionsRes, adminsRes, studentsRes] = await Promise.all([
        getAllElections().catch(() => ({ elections: [] })),
        getAllAdmins().catch(() => ({ admins: [] })),
        getAllStudents().catch(() => ({ students: [] })),
      ]);

      setElections(
        electionsRes.elections || electionsRes.data || electionsRes || []
      );
      setAdmins(adminsRes.admins || adminsRes.data || adminsRes || []);
      setStudents(
        studentsRes.students || studentsRes.data || studentsRes || []
      );
    } catch (err) {
      console.error("Super Admin Dashboard Error:", err);
      setError(
        err.response?.data?.message || "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Election Status Transition
  const handleOpenStatusModal = (election, newStatus) => {
    setSelectedElection(election);
    setTargetStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedElection || !targetStatus) return;

    try {
      setActionLoading(true);

      await updateElectionStatus(selectedElection.id, targetStatus);

      toast.success(
        `Election status changed to "${targetStatus}" successfully.`
      );

      setIsStatusModalOpen(false);
      loadDashboardData(true);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(
        err.response?.data?.message || "Failed to update election status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Election
  const handleCreateElectionSubmit = async (e) => {
    e.preventDefault();
    if (!electionForm.title || !electionForm.startDate || !electionForm.endDate) {
      toast.error("Title, start date, and end date are required.");
      return;
    }

    try {
      setActionLoading(true);
      await createElection(electionForm);
      toast.success("Election session created successfully!");
      setIsCreateElectionOpen(false);
      setElectionForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      loadDashboardData(true);
    } catch (err) {
      console.error("Create election error:", err);
      toast.error(
        err.response?.data?.message || "Failed to create election."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Admin
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.departmentId) {
      toast.error("Name, email, and department are required.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await createAdmin({
        name: adminForm.name,
        email: adminForm.email,
        departmentId: Number(adminForm.departmentId),
        yearId: adminForm.yearId ? Number(adminForm.yearId) : null,
        sectionId: adminForm.sectionId ? Number(adminForm.sectionId) : null,
      });

      toast.success(
        `Department admin "${adminForm.name}" created! Temp Password: ${
          res.temporaryPassword || "Generated"
        }`
      );
      setIsCreateAdminOpen(false);
      setAdminForm({
        name: "",
        email: "",
        departmentId: "1",
        yearId: "",
        sectionId: "",
      });
      loadDashboardData(true);
    } catch (err) {
      console.error("Create admin error:", err);
      toast.error(err.response?.data?.message || "Failed to create admin.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Student
  const handleCreateStudentSubmit = async (e) => {
    e.preventDefault();
    if (
      !studentForm.studentId ||
      !studentForm.fullName ||
      !studentForm.email ||
      !studentForm.departmentId ||
      !studentForm.yearId ||
      !studentForm.sectionId
    ) {
      toast.error("All required fields must be completed.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await createStudent({
        studentId: studentForm.studentId,
        fullName: studentForm.fullName,
        email: studentForm.email,
        departmentId: Number(studentForm.departmentId),
        yearId: Number(studentForm.yearId),
        sectionId: Number(studentForm.sectionId),
        phone: studentForm.phone || null,
      });

      toast.success(
        `Student "${studentForm.fullName}" registered! Temp Password: ${
          res.temporaryPassword || "Generated"
        }`
      );
      setIsCreateStudentOpen(false);
      setStudentForm({
        studentId: "",
        fullName: "",
        email: "",
        departmentId: "1",
        yearId: "1",
        sectionId: "1",
        phone: "",
      });
      loadDashboardData(true);
    } catch (err) {
      console.error("Create student error:", err);
      toast.error(err.response?.data?.message || "Failed to create student.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered elections
  const activeCount = elections.filter((e) => e.status === "ACTIVE").length;
  const closedCount = elections.filter((e) => e.status === "CLOSED").length;
  const publishedCount = elections.filter(
    (e) => e.status === "RESULT_PUBLISHED"
  ).length;

  const filteredElections = elections.filter((e) => {
    const matchesFilter =
      electionFilter === "ALL" || e.status === electionFilter;
    const matchesSearch =
      (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredAdmins = admins.filter(
    (a) =>
      (a.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.department_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      (s.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.student_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar subtitle="Super Admin Console" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
              <ShieldCheck size={14} className="text-blue-600" />
              <span>Full System Administration</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Logged in as <strong className="text-gray-800">{user?.email}</strong>. Manage elections, review vote tallies, certify results, and oversee academic rosters.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin text-blue-600" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={() => setIsCreateElectionOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition"
            >
              <PlusCircle size={17} />
              <span>New Election</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" message={error} />}

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Elections"
            value={elections.length}
            icon={<Vote size={22} />}
          />
          <StatCard
            title="Live & Active"
            value={activeCount}
            icon={<CheckCircle2 size={22} />}
          />
          <StatCard
            title="Closed (Tabulation)"
            value={closedCount}
            icon={<Lock size={22} />}
          />
          <StatCard
            title="Results Published"
            value={publishedCount}
            icon={<Trophy size={22} />}
          />
          <StatCard
            title="Dept Admins"
            value={admins.length}
            icon={<UserCheck size={22} />}
          />
          <StatCard
            title="Registered Students"
            value={students.length}
            icon={<GraduationCap size={22} />}
          />
        </div>

        {/* Main Tab Navigation Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Tabs bar */}
          <div className="border-b border-gray-100 px-6 pt-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab("elections");
                  setSearchQuery("");
                }}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === "elections"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Vote size={18} />
                <span>Elections ({elections.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("admins");
                  setSearchQuery("");
                }}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === "admins"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <UserCheck size={18} />
                <span>Department Admins ({admins.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("students");
                  setSearchQuery("");
                }}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === "students"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <GraduationCap size={18} />
                <span>Students Roster ({students.length})</span>
              </button>
            </div>

            {/* Quick Action Button for the active tab */}
            <div className="pb-4">
              {activeTab === "admins" && (
                <button
                  onClick={() => setIsCreateAdminOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition"
                >
                  <Plus size={15} />
                  <span>Add Admin</span>
                </button>
              )}
              {activeTab === "students" && (
                <button
                  onClick={() => setIsCreateStudentOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition"
                >
                  <Plus size={15} />
                  <span>Register Student</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={
                  activeTab === "elections"
                    ? "Search elections by title..."
                    : activeTab === "admins"
                    ? "Search department admins..."
                    : "Search students by name or ID..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            {/* Status Filter Chips (Only for Elections) */}
            {activeTab === "elections" && (
              <div className="flex items-center gap-1.5 overflow-x-auto flex-wrap">
                {["ALL", "ACTIVE", "CLOSED", "RESULT_PUBLISHED", "UPCOMING"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setElectionFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        electionFilter === status
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {status === "ALL"
                        ? "All"
                        : status === "RESULT_PUBLISHED"
                        ? "Published"
                        : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* TAB 1: ELECTIONS */}
          {activeTab === "elections" && (
            <div className="p-6 sm:p-8">
              {loading ? (
                <div className="py-16 text-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading elections list...</p>
                </div>
              ) : filteredElections.length === 0 ? (
                <EmptyState
                  icon={<Vote size={32} />}
                  title="No elections match your filter"
                  message="Try changing the filter or create a new election session."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredElections.map((election) => {
                    const isClosed = election.status === "CLOSED";
                    const isPublished = election.status === "RESULT_PUBLISHED";
                    const isActive = election.status === "ACTIVE";
                    const isUpcoming = election.status === "UPCOMING" || election.status === "DRAFT";
                    const canViewResults = isClosed || isPublished;

                    return (
                      <div
                        key={election.id}
                        className={`rounded-3xl border p-6 flex flex-col justify-between transition hover:shadow-md ${
                          isPublished
                            ? "border-purple-200 bg-purple-50/20"
                            : isClosed
                            ? "border-amber-200 bg-amber-50/20"
                            : isActive
                            ? "border-green-200 bg-green-50/10"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div>
                          {/* Top Badge */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div
                              className={`p-2.5 rounded-xl ${
                                isPublished
                                  ? "bg-purple-100 text-purple-700"
                                  : isClosed
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {isPublished ? (
                                <Trophy size={20} />
                              ) : isClosed ? (
                                <Lock size={20} />
                              ) : (
                                <Vote size={20} />
                              )}
                            </div>

                            {/* Status Badges */}
                            {isPublished && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                <Award size={13} />
                                Results Published
                              </span>
                            )}
                            {isClosed && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Lock size={13} />
                                Closed
                              </span>
                            )}
                            {isActive && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live & Active
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                <Clock size={13} />
                                Upcoming
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                            {election.title}
                          </h3>

                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {election.description || "College election session."}
                          </p>

                          {/* Dates */}
                          <div className="mt-4 space-y-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                            {election.start_date && (
                              <div className="flex items-center gap-2">
                                <CalendarDays size={14} className="text-blue-500" />
                                <span>
                                  Starts: {new Date(election.start_date).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {election.end_date && (
                              <div className="flex items-center gap-2">
                                <CalendarDays size={14} className="text-orange-500" />
                                <span>
                                  Ends: {new Date(election.end_date).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-2 space-y-2">
                          {/* View Results Button (For CLOSED and RESULT_PUBLISHED) */}
                          {canViewResults && (
                            <Link
                              to={`/super-admin/elections/${election.id}/results`}
                              className={`flex items-center justify-center gap-2 w-full rounded-xl py-2.5 font-bold text-sm text-white transition shadow-xs ${
                                isPublished
                                  ? "bg-purple-600 hover:bg-purple-700"
                                  : "bg-amber-600 hover:bg-amber-700"
                              }`}
                            >
                              <Trophy size={16} />
                              <span>View Results</span>
                              <ChevronRight size={16} />
                            </Link>
                          )}

                          {/* Live Tally and Close Actions for ACTIVE */}
                          {isActive && (
                            <div className="space-y-2">
                              <Link
                                to={`/super-admin/elections/${election.id}/results`}
                                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 font-bold text-sm text-white transition shadow-xs"
                              >
                                <BarChart3 size={16} />
                                <span>View Live Tally</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(election, "CLOSED")}
                                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gray-100 hover:bg-amber-50 hover:text-amber-800 py-2 text-xs font-semibold text-gray-700 transition border border-gray-200"
                              >
                                <Lock size={13} />
                                <span>Close Voting & Finalize</span>
                              </button>
                            </div>
                          )}

                          {/* Activate Button for UPCOMING */}
                          {isUpcoming && (
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(election, "ACTIVE")}
                              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-green-600 hover:bg-green-700 py-2.5 font-bold text-sm text-white transition shadow-xs"
                            >
                              <CheckCircle2 size={16} />
                              <span>Start Voting (Activate)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEPARTMENT ADMINS */}
          {activeTab === "admins" && (
            <div className="p-6 sm:p-8">
              {filteredAdmins.length === 0 ? (
                <EmptyState
                  icon={<UserCheck size={32} />}
                  title="No department administrators found"
                  message="Add your first department admin to manage voter rosters."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAdmins.map((admin) => (
                    <div
                      key={admin.id || admin.user_id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs">
                            {(admin.full_name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-base">
                              {admin.full_name}
                            </h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700">
                              <Building size={11} />
                              {admin.department_name || `Dept #${admin.department_id}`}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-gray-400" />
                            <span className="text-gray-700 font-medium">
                              {admin.email}
                            </span>
                          </div>
                          {(admin.year_name || admin.year_id) && (
                            <div className="text-gray-500">
                              Year Scope: {admin.year_name || `Year ${admin.year_id}`}
                            </div>
                          )}
                          {(admin.section_name || admin.section_id) && (
                            <div className="text-gray-500">
                              Section Scope: {admin.section_name || `Section ${admin.section_id}`}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                        <span>Role: ADMIN</span>
                        <span className="text-emerald-700 font-semibold">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENTS ROSTER */}
          {activeTab === "students" && (
            <div className="p-6 sm:p-8">
              {filteredStudents.length === 0 ? (
                <EmptyState
                  icon={<GraduationCap size={32} />}
                  title="No students found"
                  message="Register student accounts to populate the voter roll."
                />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3.5">Student ID</th>
                        <th className="px-5 py-3.5">Full Name</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Department</th>
                        <th className="px-5 py-3.5">Year / Section</th>
                        <th className="px-5 py-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/60 transition">
                          <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-600">
                            {s.student_id}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">
                            {s.full_name}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">
                            {s.email}
                          </td>
                          <td className="px-5 py-3.5 text-gray-700 text-xs">
                            {s.department_name || `Dept #${s.department_id}`}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">
                            {s.year_name || `Year ${s.year_id}`} • {s.section_name || `Sec ${s.section_id}`}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* CREATE ELECTION MODAL */}
      <Modal
        isOpen={isCreateElectionOpen}
        onClose={() => setIsCreateElectionOpen(false)}
        title="Create New Election"
        subtitle="Configure election parameters and voting window for the college"
        icon={<Vote size={22} className="text-blue-600" />}
        confirmText={actionLoading ? "Creating..." : "Create Election"}
        confirmDisabled={actionLoading}
        onConfirm={handleCreateElectionSubmit}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateElectionSubmit} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="electionTitle"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              Election Title <span className="text-red-500">*</span>
            </label>
            <input
              id="electionTitle"
              type="text"
              required
              placeholder="e.g. Student Council General Election 2026"
              value={electionForm.title}
              onChange={(e) =>
                setElectionForm({ ...electionForm, title: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          <div>
            <label
              htmlFor="electionDesc"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              Description <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <textarea
              id="electionDesc"
              rows={3}
              placeholder="Brief summary of council positions, candidate qualifications, and voting instructions..."
              value={electionForm.description}
              onChange={(e) =>
                setElectionForm({ ...electionForm, description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="startDate"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                id="startDate"
                type="datetime-local"
                required
                value={electionForm.startDate}
                onChange={(e) =>
                  setElectionForm({ ...electionForm, startDate: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                id="endDate"
                type="datetime-local"
                required
                value={electionForm.endDate}
                onChange={(e) =>
                  setElectionForm({ ...electionForm, endDate: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* CREATE ADMIN MODAL */}
      <Modal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        title="Add Department Administrator"
        subtitle="Create an admin account to oversee department-level elections and class rosters"
        icon={<UserCheck size={22} className="text-blue-600" />}
        confirmText={actionLoading ? "Creating..." : "Create Admin Account"}
        confirmDisabled={actionLoading}
        onConfirm={handleCreateAdminSubmit}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="adminName"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              Admin Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="adminName"
              type="text"
              required
              placeholder="e.g. Dr. Rajesh Kumar"
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          <div>
            <label
              htmlFor="adminEmail"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              College Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="adminEmail"
              type="email"
              required
              placeholder="e.g. rajesh.kumar@college.edu"
              value={adminForm.email}
              onChange={(e) =>
                setAdminForm({ ...adminForm, email: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="adminDept"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Dept ID <span className="text-red-500">*</span>
              </label>
              <input
                id="adminDept"
                type="number"
                required
                min={1}
                value={adminForm.departmentId}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, departmentId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label
                htmlFor="adminYear"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Year ID <span className="text-gray-400 font-normal text-[10px]">(Opt)</span>
              </label>
              <input
                id="adminYear"
                type="number"
                min={1}
                placeholder="e.g. 1"
                value={adminForm.yearId}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, yearId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label
                htmlFor="adminSection"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Section ID <span className="text-gray-400 font-normal text-[10px]">(Opt)</span>
              </label>
              <input
                id="adminSection"
                type="number"
                min={1}
                placeholder="e.g. 1"
                value={adminForm.sectionId}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, sectionId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* CREATE STUDENT MODAL */}
      <Modal
        isOpen={isCreateStudentOpen}
        onClose={() => setIsCreateStudentOpen(false)}
        title="Register Student Account"
        subtitle="Add a student account with assigned department, year, and section scope"
        icon={<GraduationCap size={22} className="text-blue-600" />}
        confirmText={actionLoading ? "Registering..." : "Register Student"}
        confirmDisabled={actionLoading}
        onConfirm={handleCreateStudentSubmit}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateStudentSubmit} className="space-y-3.5 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="superStuId"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                id="superStuId"
                type="text"
                required
                placeholder="e.g. 21CS099"
                value={studentForm.studentId}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, studentId: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label
                htmlFor="superStuName"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="superStuName"
                type="text"
                required
                placeholder="Student Full Name"
                value={studentForm.fullName}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, fullName: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="superStuEmail"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              College Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="superStuEmail"
              type="email"
              required
              placeholder="student@college.edu"
              value={studentForm.email}
              onChange={(e) =>
                setStudentForm({ ...studentForm, email: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label
                htmlFor="superStuDept"
                className="block text-[10px] font-bold uppercase text-gray-700 mb-1"
              >
                Dept ID <span className="text-red-500">*</span>
              </label>
              <input
                id="superStuDept"
                type="number"
                min={1}
                required
                value={studentForm.departmentId}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, departmentId: e.target.value })
                }
                className="w-full px-2.5 py-2 bg-slate-50/70 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label
                htmlFor="superStuYear"
                className="block text-[10px] font-bold uppercase text-gray-700 mb-1"
              >
                Year ID <span className="text-red-500">*</span>
              </label>
              <input
                id="superStuYear"
                type="number"
                min={1}
                required
                value={studentForm.yearId}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, yearId: e.target.value })
                }
                className="w-full px-2.5 py-2 bg-slate-50/70 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label
                htmlFor="superStuSec"
                className="block text-[10px] font-bold uppercase text-gray-700 mb-1"
              >
                Sec ID <span className="text-red-500">*</span>
              </label>
              <input
                id="superStuSec"
                type="number"
                min={1}
                required
                value={studentForm.sectionId}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, sectionId: e.target.value })
                }
                className="w-full px-2.5 py-2 bg-slate-50/70 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="superStuPhone"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              Phone Number <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              id="superStuPhone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={studentForm.phone}
              onChange={(e) =>
                setStudentForm({ ...studentForm, phone: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
            />
          </div>
        </form>
      </Modal>

      {/* CONFIRM STATUS MODAL */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          if (!actionLoading) setIsStatusModalOpen(false);
        }}
        title={`Change Election Status to "${targetStatus}"`}
        subtitle="Confirm election lifecycle transition"
        icon={<Lock size={22} className="text-amber-600" />}
        confirmText={actionLoading ? "Updating..." : "Confirm Status Change"}
        confirmDisabled={actionLoading}
        confirmVariant="primary"
        onConfirm={handleConfirmStatusChange}
      >
        <p className="text-gray-600 text-sm leading-relaxed text-center sm:text-left">
          Are you sure you want to transition the status of <strong>{selectedElection?.title}</strong> to <strong className="text-blue-600">{targetStatus}</strong>?
        </p>
      </Modal>
    </div>
  );
}