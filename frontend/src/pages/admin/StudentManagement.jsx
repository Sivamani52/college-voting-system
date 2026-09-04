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
  });
  const [formErrors, setFormErrors] = useState({});

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

        return (
          studentId.includes(query) ||
          fullName.includes(query) ||
          email.includes(query)
        );
      }

      return true;
    });
  }, [students, statusFilter, searchQuery]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.studentId.trim()) {
      errors.studentId = "Student ID is required";
    }
    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "College Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (
      adminProfile &&
      (!adminProfile.department_id ||
        !adminProfile.year_id ||
        !adminProfile.section_id)
    ) {
      errors.profile =
        "Your Admin profile is missing Department, Year, or Section assignments. Please contact Super Admin.";
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
      const payload = {
        studentId: formData.studentId.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        departmentId: adminProfile.department_id,
        yearId: adminProfile.year_id,
        sectionId: adminProfile.section_id,
      };

      const res = await createStudent(payload);
      toast.success(res?.message || "Student created successfully");
      setIsCreateModalOpen(false);
      setFormData({
        studentId: "",
        fullName: "",
        email: "",
        phone: "",
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
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Student Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage students assigned to your class.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs disabled:opacity-50"
              title="Refresh students"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin text-blue-600" : "text-gray-500"}
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenModal}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-semibold text-white transition shadow-xs disabled:opacity-50"
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Assigned Class Scope
              </h2>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {adminProfile?.full_name ? `${adminProfile.full_name}'s Class` : "Class Scope"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-200">
              <Building2 size={13} className="text-gray-500" />
              <span>Department ID:</span>
              <strong className="text-gray-900">
                {adminProfile?.department_id ?? (loading ? "..." : "N/A")}
              </strong>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-200">
              <Calendar size={13} className="text-gray-500" />
              <span>Year ID:</span>
              <strong className="text-gray-900">
                {adminProfile?.year_id ?? (loading ? "..." : "N/A")}
              </strong>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-200">
              <Layers size={13} className="text-gray-500" />
              <span>Section ID:</span>
              <strong className="text-gray-900">
                {adminProfile?.section_id ?? (loading ? "..." : "N/A")}
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
          />
          <StatCard
            title="Active Students"
            value={loading ? "..." : stats.active}
            icon={<UserCheck size={22} className="text-emerald-600" />}
          />
          <StatCard
            title="Inactive Students"
            value={loading ? "..." : stats.inactive}
            icon={<UserX size={22} className="text-amber-600" />}
          />
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by Student ID, Name, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <Filter size={14} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Table / List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {loading ? (
            /* Loading State */
            <div className="p-12 text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 animate-spin">
                <RefreshCw size={24} />
              </div>
              <p className="text-sm font-medium text-gray-600">
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition"
                  >
                    <span>Clear Search & Filters</span>
                  </button>
                }
              />
            </div>
          ) : (
            /* Table Data */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Student
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Student ID
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Email
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      Phone
                    </th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-right sm:text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
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
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        {/* Student Name & Avatar */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {fullName}
                              </p>
                              <p className="text-xs text-gray-400 sm:hidden truncate">
                                {studentId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-4 px-4 sm:px-6">
                          <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                            {studentId}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 sm:px-6 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail size={14} className="text-gray-400 shrink-0 hidden sm:inline" />
                            <span className="truncate max-w-[200px] text-xs sm:text-sm">
                              {email}
                            </span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-4 sm:px-6 text-gray-600 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            {phone !== "—" && (
                              <Phone size={14} className="text-gray-400 shrink-0 hidden sm:inline" />
                            )}
                            <span>{phone}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 sm:px-6 text-right sm:text-left">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              INACTIVE
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Footer with count */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
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
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            if (!createLoading) {
              setIsCreateModalOpen(false);
            }
          }}
          title="Add Student"
          icon={<UserPlus size={24} className="text-blue-600" />}
          confirmText={createLoading ? "Creating..." : "Add Student"}
          cancelText="Cancel"
          onConfirm={handleCreateStudent}
          confirmDisabled={createLoading}
        >
          <form onSubmit={handleCreateStudent} className="space-y-4 text-left">
            {/* Auto-Assigned Class Scope Info */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 space-y-1">
              <p className="font-semibold text-blue-900 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-blue-600" />
                Class Scope (Auto-Assigned from Admin Profile)
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 font-medium text-blue-950">
                <div className="bg-white/80 rounded-lg p-1.5 border border-blue-100 text-center">
                  <span className="block text-[10px] text-gray-500">Dept ID</span>
                  <strong>{adminProfile?.department_id ?? "N/A"}</strong>
                </div>
                <div className="bg-white/80 rounded-lg p-1.5 border border-blue-100 text-center">
                  <span className="block text-[10px] text-gray-500">Year ID</span>
                  <strong>{adminProfile?.year_id ?? "N/A"}</strong>
                </div>
                <div className="bg-white/80 rounded-lg p-1.5 border border-blue-100 text-center">
                  <span className="block text-[10px] text-gray-500">Section ID</span>
                  <strong>{adminProfile?.section_id ?? "N/A"}</strong>
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  className={`w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    formErrors.studentId
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {formErrors.studentId && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
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
                className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  formErrors.fullName
                    ? "border-red-300 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {formErrors.fullName && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g. john.doe@college.edu"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) {
                      setFormErrors({ ...formErrors, email: null });
                    }
                  }}
                  className={`w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    formErrors.email
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Phone <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}