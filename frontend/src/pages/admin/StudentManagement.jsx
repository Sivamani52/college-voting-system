import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  Mail,
  Phone,
  Hash,
  AlertCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  User,
  Eye,
  Info,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import {
  getMyAdminProfile,
  getAllStudents,
  createStudent,
} from "../../services/studentService";

export default function StudentManagement() {
  const [adminProfile, setAdminProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Student Modal & Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    phone: "",
    yearId: "1",
    sectionId: "1",
  });
  const [formErrors, setFormErrors] = useState({});

  // View Student Details Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch Admin Profile and Students
  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      // 1. Fetch Admin Profile
      const profileRes = await getMyAdminProfile();
      const profile = profileRes?.admin || profileRes;
      setAdminProfile(profile);

      // 2. Fetch Students (backend handles admin scoping)
      const studentsRes = await getAllStudents();
      const studentList = Array.isArray(studentsRes)
        ? studentsRes
        : studentsRes?.students || [];
      setStudents(studentList);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load student management data.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(
      (s) => (s.status || s.user_status || "").toUpperCase() === "ACTIVE"
    ).length;
    const inactive = students.filter(
      (s) => (s.status || s.user_status || "").toUpperCase() === "INACTIVE"
    ).length;

    return { total, active, inactive };
  }, [students]);

  // Filtered Students based on search and status filter
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Status Filter
      const currentStatus = (
        student.status ||
        student.user_status ||
        ""
      ).toUpperCase();
      if (statusFilter !== "ALL" && currentStatus !== statusFilter) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const studentId = (
          student.student_id ||
          student.studentId ||
          ""
        ).toLowerCase();
        const fullName = (
          student.full_name ||
          student.name ||
          ""
        ).toLowerCase();
        const email = (student.email || "").toLowerCase();
        const phone = (student.phone || "").toLowerCase();

        return (
          studentId.includes(query) ||
          fullName.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        );
      }

      return true;
    });
  }, [students, statusFilter, searchQuery]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.studentId.trim()) {
      errors.studentId = "Student ID is required (e.g. 21CS001)";
    }
    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "College Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid college email address";
    }

    if (!adminProfile?.department_id) {
      errors.profile =
        "Your Admin profile is missing a Department assignment. Please contact Super Admin.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleCreateStudent = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!validateForm()) {
      if (formErrors.profile) {
        toast.error(formErrors.profile);
      } else {
        toast.error("Please fill in all required fields correctly.");
      }
      return;
    }

    setCreateLoading(true);
    try {
      const targetYearId = adminProfile.year_id || Number(formData.yearId) || 1;
      const targetSectionId = adminProfile.section_id || Number(formData.sectionId) || 1;

      const payload = {
        studentId: formData.studentId.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        departmentId: Number(adminProfile.department_id),
        yearId: targetYearId,
        sectionId: targetSectionId,
      };

      const res = await createStudent(payload);
      toast.success(res?.message || "Student created successfully! Temporary credentials generated.");
      setIsCreateModalOpen(false);
      setFormData({
        studentId: "",
        fullName: "",
        email: "",
        phone: "",
        yearId: "1",
        sectionId: "1",
      });
      setFormErrors({});
      await loadData(false);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create student";
      toast.error(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      studentId: "",
      fullName: "",
      email: "",
      phone: "",
      yearId: String(adminProfile?.year_id || "1"),
      sectionId: String(adminProfile?.section_id || "1"),
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleOpenViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                <Users size={12} /> Class Roster
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
              Student Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              View and register students belonging to your assigned department class.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-98 transition shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Refresh students"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin text-blue-600" : "text-gray-500"}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenModal}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs sm:text-sm font-bold text-white shadow-xs shadow-blue-500/20 active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Class Assignment Badge Info */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-2xs">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Assigned Class Scope
              </h2>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {adminProfile?.full_name ? `${adminProfile.full_name}'s Department Class` : "Department Class Scope"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-gray-700 font-semibold border border-gray-200/70 shadow-2xs">
              <Building2 size={13} className="text-blue-600" />
              <span className="text-gray-500">Dept ID:</span>
              <strong className="text-gray-900 font-mono">
                {adminProfile?.department_id ?? (loading ? "..." : "N/A")}
              </strong>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-gray-700 font-semibold border border-gray-200/70 shadow-2xs">
              <Calendar size={13} className="text-blue-600" />
              <span className="text-gray-500">Year ID:</span>
              <strong className="text-gray-900 font-mono">
                {adminProfile?.year_id ?? (loading ? "..." : "All / Dept-Wide")}
              </strong>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-gray-700 font-semibold border border-gray-200/70 shadow-2xs">
              <Layers size={13} className="text-blue-600" />
              <span className="text-gray-500">Section ID:</span>
              <strong className="text-gray-900 font-mono">
                {adminProfile?.section_id ?? (loading ? "..." : "All / Dept-Wide")}
              </strong>
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Students"
            value={loading ? "..." : stats.total}
            icon={<Users size={22} />}
            description="Enrolled in class roster"
          />
          <StatCard
            title="Active Voters"
            value={loading ? "..." : stats.active}
            icon={<UserCheck size={22} className="text-emerald-600" />}
            description="Eligible to cast ballots"
          />
          <StatCard
            title="Inactive Accounts"
            value={loading ? "..." : stats.inactive}
            icon={<UserX size={22} className="text-amber-600" />}
            description="Suspended or pending"
          />
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by Student ID, Name, Email, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-slate-50/80 border border-gray-200/80 rounded-xl px-3 py-2 w-full sm:w-auto shadow-2xs">
              <Filter size={14} className="text-gray-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-500">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Voters</option>
                <option value="INACTIVE">Inactive Voters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Table / List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            /* Loading State */
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Loading students roster...
              </p>
            </div>
          ) : students.length === 0 ? (
            /* Empty State: No students in class */
            <div className="p-8 sm:p-12">
              <EmptyState
                icon={<Users size={32} />}
                title="No students found"
                message="There are no students registered in your assigned class yet."
                action={
                  <button
                    type="button"
                    onClick={handleOpenModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                  >
                    <UserPlus size={16} />
                    <span>Add First Student</span>
                  </button>
                }
              />
            </div>
          ) : filteredStudents.length === 0 ? (
            /* Empty State: Search / Filter produced 0 matches */
            <div className="p-8 sm:p-12">
              <EmptyState
                icon={<Search size={32} />}
                title="No matching students found"
                message="No students match the search criteria or selected status filter."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                  >
                    <span>Clear Search & Filters</span>
                  </button>
                }
              />
            </div>
          ) : (
            /* Table Data */
            <div className="overflow-x-auto table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Student
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Student ID
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      College Email
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 hidden md:table-cell">
                      Phone Number
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Voter Status
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {filteredStudents.map((student) => {
                    const studentId = student.student_id || student.studentId || "—";
                    const fullName = student.full_name || student.name || "Unnamed Student";
                    const email = student.email || "No email";
                    const phone = student.phone || "—";
                    const rawStatus = (student.status || student.user_status || "ACTIVE").toUpperCase();
                    const isActive = rawStatus === "ACTIVE";

                    return (
                      <tr
                        key={student.id || student.student_id || studentId}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Student Name & Avatar */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200 shadow-2xs">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate leading-tight">
                                {fullName}
                              </p>
                              <p className="text-[11px] text-gray-400 sm:hidden font-mono mt-0.5 truncate">
                                ID: {studentId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-4 px-4 sm:px-6">
                          <span className="font-mono text-xs font-bold text-gray-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-gray-200/80 shadow-2xs">
                            {studentId}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 sm:px-6 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail size={14} className="text-gray-400 shrink-0 hidden sm:inline" />
                            <span className="truncate max-w-[200px] text-xs sm:text-sm font-medium">
                              {email}
                            </span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-4 sm:px-6 text-gray-600 text-xs sm:text-sm hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            {phone !== "—" && (
                              <Phone size={14} className="text-gray-400 shrink-0" />
                            )}
                            <span className="font-medium">{phone}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 sm:px-6">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(student)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
                            title="View student profile details"
                          >
                            <Eye size={13} />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Footer with count */}
              <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 font-medium">
                <span>
                  Showing <strong>{filteredStudents.length}</strong> of{" "}
                  <strong>{students.length}</strong> student{students.length === 1 ? "" : "s"}
                </span>
                {(searchQuery || statusFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* View Student Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Student Profile Details"
          subtitle="Complete record of registered student"
          icon={<User size={22} className="text-blue-600" />}
          cancelText="Close"
          maxWidth="max-w-lg"
        >
          {selectedStudent && (
            <div className="space-y-4 text-left">
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200/80 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs uppercase">
                  {(selectedStudent.full_name || selectedStudent.name || "S").charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-gray-900 text-base">
                      {selectedStudent.full_name || selectedStudent.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                      STUDENT
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    ID: {selectedStudent.student_id || selectedStudent.studentId || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">College Email</span>
                  <p className="font-semibold text-gray-800 break-all">{selectedStudent.email || "N/A"}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</span>
                  <p className="font-semibold text-gray-800">{selectedStudent.phone || "Not provided"}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Department ID</span>
                  <p className="font-semibold text-gray-800">Department #{selectedStudent.department_id || adminProfile?.department_id || "N/A"}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Year / Section ID</span>
                  <p className="font-semibold text-gray-800">
                    Year #{selectedStudent.year_id || 1} • Sec #{selectedStudent.section_id || 1}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs space-y-1 col-span-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Voter Account Status</span>
                  <div className="pt-0.5">
                    {(selectedStudent.status || selectedStudent.user_status || "ACTIVE").toUpperCase() === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} /> Active Eligible Voter
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        Inactive / Suspended
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Add Student Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            if (!createLoading) {
              setIsCreateModalOpen(false);
            }
          }}
          title="Add New Student"
          subtitle="Register a student account into your assigned department class"
          icon={<UserPlus size={22} className="text-blue-600" />}
          confirmText={createLoading ? "Registering..." : "Create Student Account"}
          cancelText="Cancel"
          onConfirm={handleCreateStudent}
          confirmDisabled={createLoading}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateStudent} className="space-y-4 text-left">
            {/* Auto-Assigned Class Scope Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3.5 text-xs text-blue-900 space-y-2 shadow-2xs">
              <p className="font-bold text-blue-950 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-600" />
                <span>Department Scope (Admin Profile #{adminProfile?.department_id})</span>
              </p>
              <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
                <div className="bg-white rounded-xl p-2 border border-blue-100/80 shadow-2xs">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Dept ID</span>
                  <strong className="text-gray-900 font-mono text-xs">{adminProfile?.department_id ?? "N/A"}</strong>
                </div>
                <div className="bg-white rounded-xl p-2 border border-blue-100/80 shadow-2xs">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Year ID</span>
                  <strong className="text-gray-900 font-mono text-xs">{adminProfile?.year_id ? `#${adminProfile.year_id}` : "Selectable"}</strong>
                </div>
                <div className="bg-white rounded-xl p-2 border border-blue-100/80 shadow-2xs">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Section ID</span>
                  <strong className="text-gray-900 font-mono text-xs">{adminProfile?.section_id ? `#${adminProfile.section_id}` : "Selectable"}</strong>
                </div>
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label
                htmlFor="studentId"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Student ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="studentId"
                  type="text"
                  required
                  placeholder="e.g. 21CS001"
                  value={formData.studentId}
                  onChange={(e) => {
                    setFormData({ ...formData, studentId: e.target.value });
                    if (formErrors.studentId) {
                      setFormErrors({ ...formErrors, studentId: null });
                    }
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition shadow-2xs ${
                    formErrors.studentId
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {formErrors.studentId && (
                <p className="text-[11px] text-red-600 mt-1 font-semibold">
                  {formErrors.studentId}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (formErrors.fullName) {
                      setFormErrors({ ...formErrors, fullName: null });
                    }
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition shadow-2xs ${
                    formErrors.fullName
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {formErrors.fullName && (
                <p className="text-[11px] text-red-600 mt-1 font-semibold">
                  {formErrors.fullName}
                </p>
              )}
            </div>

            {/* College Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                College Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g. john.doe@college.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) {
                      setFormErrors({ ...formErrors, email: null });
                    }
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition shadow-2xs ${
                    formErrors.email
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-red-600 mt-1 font-semibold">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Year & Section (Only active if not locked by Admin Profile) */}
            {!adminProfile?.year_id && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="yearSelect"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="yearSelect"
                    value={formData.yearId}
                    onChange={(e) => setFormData({ ...formData, yearId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="1">1st Year (ID #1)</option>
                    <option value="2">2nd Year (ID #2)</option>
                    <option value="3">3rd Year (ID #3)</option>
                    <option value="4">4th Year (ID #4)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sectionSelect"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sectionSelect"
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="1">Section A (ID #1)</option>
                    <option value="2">Section B (ID #2)</option>
                    <option value="3">Section C (ID #3)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Phone Number <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                />
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}