import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
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
  X,
  ShieldCheck,
  CheckCircle2,
  User,
  Eye,
  Info,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import { useAuth } from "../../context/useAuth";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import {
  getMyAdminProfile,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
} from "../../services/studentService";

export default function StudentManagement() {
  const { user } = useAuth();
  const Layout = user?.role === "SUPER_ADMIN" ? SuperAdminLayout : AdminLayout;
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

  const params = useParams();
  const location = useLocation();

  // View Student Details Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Student Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    yearId: "1",
    sectionId: "1",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete Student Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setEditFormData({
      fullName: student.full_name || student.name || "",
      phone: student.phone || "",
      yearId: String(student.year_id || adminProfile?.year_id || "1"),
      sectionId: String(student.section_id || adminProfile?.section_id || "1"),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editFormData.fullName.trim()) {
      toast.error("Student name is required.");
      return;
    }

    try {
      setEditLoading(true);
      await updateStudent(editingStudent.id, {
        fullName: editFormData.fullName.trim(),
        phone: editFormData.phone.trim() || undefined,
        yearId: Number(editFormData.yearId),
        sectionId: Number(editFormData.sectionId),
      });

      toast.success("Student updated successfully!");
      setIsEditModalOpen(false);
      setEditingStudent(null);
      await loadData(false);
    } catch (err) {
      console.error("Update student error:", err);
      toast.error(err.response?.data?.message || "Failed to update student.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (student) => {
    const currentStatus = student.status || student.user_status || "ACTIVE";
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await toggleStudentStatus(student.id, nextStatus);
      toast.success(`Student marked as ${nextStatus}!`);
      await loadData(false);
    } catch (err) {
      console.error("Toggle student status error:", err);
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteStudent(studentToDelete.id);
      toast.success("Student deleted successfully!");
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      await loadData(false);
    } catch (err) {
      console.error("Delete student error:", err);
      toast.error(err.response?.data?.message || "Failed to delete student.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Route Synchronization Effect for /admin/students/add, /admin/students/:id, /admin/students/:id/edit
  useEffect(() => {
    if (location.pathname.endsWith("/add")) {
      handleOpenModal();
    } else if (params.id && students.length > 0) {
      const matched = students.find(
        (s) => String(s.id) === String(params.id) || String(s.student_id) === String(params.id)
      );
      if (matched) {
        if (location.pathname.endsWith("/edit")) {
          handleOpenEditModal(matched);
        } else {
          handleOpenViewModal(matched);
        }
      }
    }
  }, [location.pathname, params.id, students]);

  return (
    <Layout>
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
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                            }`}
                            title={`Click to mark as ${isActive ? "Inactive" : "Active"}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                              }`}
                            />
                            {isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenViewModal(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
                              title="View student profile details"
                            >
                              <Eye size={13} />
                              <span className="hidden lg:inline">Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition cursor-pointer"
                              title="Edit student"
                            >
                              <Edit2 size={13} />
                              <span className="hidden lg:inline">Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStudentToDelete(student);
                                setIsDeleteModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
                              title="Delete student"
                            >
                              <Trash2 size={13} />
                              <span className="hidden lg:inline">Delete</span>
                            </button>
                          </div>
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
            {/* Auto-Assigned Section Scope Info */}
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-950 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-[11px] text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-blue-700" />
                  Assigned Student Scope
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Locked to Your Section
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-semibold text-xs bg-white/70 rounded-xl p-2.5 border border-blue-100">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Department</span>
                  <span className="font-bold text-gray-900">{adminProfile?.department_code || adminProfile?.department_name || "Department"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Year</span>
                  <span className="font-bold text-gray-900">{adminProfile?.year_name || (adminProfile?.year_id ? `Year ${adminProfile.year_id}` : "All Years")}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Section</span>
                  <span className="font-bold text-gray-900">{adminProfile?.section_name ? `Section ${adminProfile.section_name}` : (adminProfile?.section_id ? `Sec ${adminProfile.section_id}` : "All Sections")}</span>
                </div>
              </div>
              <p className="text-[11px] text-blue-700 font-medium">
                New students will automatically belong to your assigned Department, Year, and Section.
              </p>
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

        {/* Edit Student Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStudent(null);
          }}
          title="Edit Student Information"
          icon={<Edit2 size={20} className="text-amber-600" />}
          confirmText={editLoading ? "Saving..." : "Save Changes"}
          cancelText="Cancel"
          onConfirm={handleUpdateStudent}
          confirmDisabled={editLoading}
          maxWidth="max-w-lg"
        >
          {editingStudent && (
            <form onSubmit={handleUpdateStudent} className="space-y-4 text-left">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                <Info size={16} className="text-amber-600 shrink-0" />
                <span>
                  Editing student: <strong>{editingStudent.student_id || editingStudent.studentId}</strong> ({editingStudent.email})
                </span>
              </div>

              <div>
                <label
                  htmlFor="editFullName"
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
                    id="editFullName"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={editFormData.fullName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, fullName: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="editPhone"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="editPhone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="editYearSelect"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    Academic Year
                  </label>
                  <select
                    id="editYearSelect"
                    value={editFormData.yearId}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, yearId: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
                  >
                    <option value="1">1st Year (ID #1)</option>
                    <option value="2">2nd Year (ID #2)</option>
                    <option value="3">3rd Year (ID #3)</option>
                    <option value="4">4th Year (ID #4)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="editSectionSelect"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    Section
                  </label>
                  <select
                    id="editSectionSelect"
                    value={editFormData.sectionId}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, sectionId: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
                  >
                    <option value="1">Section A (ID #1)</option>
                    <option value="2">Section B (ID #2)</option>
                    <option value="3">Section C (ID #3)</option>
                  </select>
                </div>
              </div>
            </form>
          )}
        </Modal>

        {/* Delete Student Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
          }}
          title="Delete Student Record"
          icon={<AlertTriangle size={20} className="text-rose-600" />}
          confirmText={deleteLoading ? "Deleting..." : "Delete Student"}
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          confirmDisabled={deleteLoading}
          danger={true}
          maxWidth="max-w-md"
        >
          {studentToDelete && (
            <div className="space-y-3 text-left">
              <p className="text-xs sm:text-sm text-gray-600">
                Are you sure you want to permanently delete the student account for:
              </p>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
                <p className="font-bold text-gray-900 text-sm">
                  {studentToDelete.full_name || studentToDelete.name}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {studentToDelete.student_id || studentToDelete.studentId} • {studentToDelete.email}
                </p>
              </div>
              <p className="text-[11px] text-rose-600 font-semibold">
                Warning: This action cannot be undone and will revoke all voter privileges for this account.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}