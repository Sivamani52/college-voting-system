import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  GraduationCap,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  Building2,
  Calendar,
  Layers,
  Mail,
  Phone,
  Hash,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
} from "../../services/studentService";
import {
  getAllDepartments,
  getYears,
  getSections,
} from "../../services/departmentService";

export default function SuperAdminStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Create Student Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formDeptId, setFormDeptId] = useState("");
  const [formYearId, setFormYearId] = useState("");
  const [formSectionId, setFormSectionId] = useState("");
  const [formDeptYears, setFormDeptYears] = useState([]);
  const [formYearSections, setFormYearSections] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    phone: "",
  });

  // View Student Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Student Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    departmentId: "",
    yearId: "",
    sectionId: "",
  });
  const [editDeptYears, setEditDeptYears] = useState([]);
  const [editYearSections, setEditYearSections] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  // Delete Student Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load Data
  const loadData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [studentsRes, deptsRes, yearsRes, sectionsRes] = await Promise.all([
        getAllStudents().catch(() => ({ students: [] })),
        getAllDepartments().catch(() => ({ departments: [] })),
        getYears().catch(() => ({ years: [] })),
        getSections().catch(() => ({ sections: [] })),
      ]);

      const sList = Array.isArray(studentsRes)
        ? studentsRes
        : studentsRes?.students || studentsRes?.data || [];
      const dList = Array.isArray(deptsRes)
        ? deptsRes
        : deptsRes?.departments || deptsRes?.data || [];
      const yList = Array.isArray(yearsRes)
        ? yearsRes
        : yearsRes?.years || yearsRes?.data || [];
      const secList = Array.isArray(sectionsRes)
        ? sectionsRes
        : sectionsRes?.sections || sectionsRes?.data || [];

      setStudents(sList);
      setDepartments(dList);
      setYears(yList);
      setSections(secList);
    } catch (err) {
      console.error("Failed to load students data:", err);
      toast.error("Failed to fetch students data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle department change in Create Modal
  useEffect(() => {
    if (formDeptId) {
      const filteredYears = years.filter(
        (y) => String(y.department_id || y.departmentId) === String(formDeptId)
      );
      setFormDeptYears(filteredYears);
      if (filteredYears.length > 0) {
        setFormYearId(String(filteredYears[0].id));
      } else {
        setFormYearId("");
      }
    } else {
      setFormDeptYears([]);
      setFormYearId("");
    }
  }, [formDeptId, years]);

  // Handle year change in Create Modal
  useEffect(() => {
    if (formYearId) {
      const filteredSecs = sections.filter(
        (s) => String(s.year_id || s.yearId) === String(formYearId)
      );
      setFormYearSections(filteredSecs);
      if (filteredSecs.length > 0) {
        setFormSectionId(String(filteredSecs[0].id));
      } else {
        setFormSectionId("");
      }
    } else {
      setFormYearSections([]);
      setFormSectionId("");
    }
  }, [formYearId, sections]);

  // Handle department change in Edit Modal
  useEffect(() => {
    if (editFormData.departmentId) {
      const filteredYears = years.filter(
        (y) =>
          String(y.department_id || y.departmentId) ===
          String(editFormData.departmentId)
      );
      setEditDeptYears(filteredYears);
    } else {
      setEditDeptYears([]);
    }
  }, [editFormData.departmentId, years]);

  // Handle year change in Edit Modal
  useEffect(() => {
    if (editFormData.yearId) {
      const filteredSecs = sections.filter(
        (s) =>
          String(s.year_id || s.yearId) === String(editFormData.yearId)
      );
      setEditYearSections(filteredSecs);
    } else {
      setEditYearSections([]);
    }
  }, [editFormData.yearId, sections]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const sId = String(student.student_id || student.studentId || "").toLowerCase();
      const name = String(student.full_name || student.name || "").toLowerCase();
      const email = String(student.email || "").toLowerCase();
      const phone = String(student.phone || "").toLowerCase();

      const matchesSearch =
        !query ||
        sId.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      // Dept Filter
      const deptId = String(student.department_id || student.departmentId || "");
      const matchesDept =
        selectedDeptFilter === "ALL" || deptId === String(selectedDeptFilter);

      // Status Filter
      const status = String(student.status || student.user_status || "ACTIVE").toUpperCase();
      const matchesStatus =
        selectedStatusFilter === "ALL" || status === selectedStatusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [students, searchQuery, selectedDeptFilter, selectedStatusFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(
      (s) => (s.status || s.user_status || "ACTIVE").toUpperCase() === "ACTIVE"
    ).length;
    const inactive = students.filter(
      (s) => (s.status || s.user_status || "").toUpperCase() === "INACTIVE"
    ).length;
    return { total, active, inactive };
  }, [students]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const defaultDept = departments[0]?.id ? String(departments[0].id) : "";
    setFormDeptId(defaultDept);
    setFormData({
      studentId: "",
      fullName: "",
      email: "",
      phone: "",
    });
    setIsCreateModalOpen(true);
  };

  // Submit Create Student
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.fullName || !formData.email) {
      toast.error("Please fill in Student ID, Full Name, and Email.");
      return;
    }
    if (!formDeptId || !formYearId || !formSectionId) {
      toast.error("Please select a department, year, and section.");
      return;
    }

    try {
      setCreateLoading(true);
      const payload = {
        studentId: formData.studentId.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        departmentId: Number(formDeptId),
        yearId: Number(formYearId),
        sectionId: Number(formSectionId),
      };

      const res = await createStudent(payload);
      toast.success(res?.message || "Student enrolled successfully!");
      setIsCreateModalOpen(false);
      loadData(false);
    } catch (err) {
      console.error("Create student error:", err);
      toast.error(err?.response?.data?.message || "Failed to create student.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setEditFormData({
      fullName: student.full_name || student.name || "",
      phone: student.phone || "",
      departmentId: String(student.department_id || student.departmentId || ""),
      yearId: String(student.year_id || student.yearId || ""),
      sectionId: String(student.section_id || student.sectionId || ""),
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setEditLoading(true);
      const payload = {
        fullName: editFormData.fullName.trim(),
        phone: editFormData.phone.trim() || undefined,
        departmentId: Number(editFormData.departmentId),
        yearId: Number(editFormData.yearId),
        sectionId: Number(editFormData.sectionId),
      };

      await updateStudent(editingStudent.id, payload);
      toast.success("Student updated successfully!");
      setIsEditModalOpen(false);
      loadData(false);
    } catch (err) {
      console.error("Update student error:", err);
      toast.error(err?.response?.data?.message || "Failed to update student.");
    } finally {
      setEditLoading(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (student) => {
    const current = (student.status || student.user_status || "ACTIVE").toUpperCase();
    const nextStatus = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await toggleStudentStatus(student.id, nextStatus);
      toast.success(`Student status marked as ${nextStatus}!`);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, status: nextStatus, user_status: nextStatus } : s
        )
      );
    } catch (err) {
      console.error("Toggle status error:", err);
      toast.error(err?.response?.data?.message || "Failed to toggle status.");
    }
  };

  // Submit Delete Student
  const handleDeleteSubmit = async () => {
    if (!studentToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteStudent(studentToDelete.id);
      toast.success("Student deleted successfully!");
      setIsDeleteModalOpen(false);
      loadData(false);
    } catch (err) {
      console.error("Delete student error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete student.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-purple-700 to-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Student Enrollment & Roster
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage registered collegiate students, roll credentials, and academic placement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>

        {/* Quick Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={loading ? "..." : stats.total}
            icon={<Users size={22} className="text-purple-600" />}
            color="purple"
          />
          <StatCard
            title="Active Voters"
            value={loading ? "..." : stats.active}
            icon={<UserCheck size={22} className="text-emerald-600" />}
            color="green"
          />
          <StatCard
            title="Inactive Accounts"
            value={loading ? "..." : stats.inactive}
            icon={<UserX size={22} className="text-red-600" />}
            color="red"
          />
          <StatCard
            title="Departments"
            value={loading ? "..." : departments.length}
            icon={<Building2 size={22} className="text-indigo-600" />}
            color="indigo"
          />
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Roll Number, Name, Email..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
              />
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-56">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={String(dept.id)}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
              Enrolled Students Directory ({filteredStudents.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Roll No / ID</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Academic Placement</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-gray-400">
                      <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading student roster...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center">
                      <EmptyState
                        icon={<GraduationCap size={36} />}
                        title="No students found"
                        message={
                          searchQuery || selectedDeptFilter !== "ALL"
                            ? "Try refining your search query or department filters."
                            : "No students have been enrolled yet. Click 'Enroll Student' to add one."
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isActive =
                      (s.status || s.user_status || "ACTIVE").toUpperCase() === "ACTIVE";

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-5 py-4 font-mono font-bold text-purple-700">
                          {s.student_id || s.studentId}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                              {(s.full_name || s.name || "S").charAt(0)}
                            </div>
                            <span>{s.full_name || s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-1.5 font-medium text-gray-700">
                              <Mail size={12} className="text-gray-400" />
                              <span>{s.email}</span>
                            </p>
                            {s.phone && (
                              <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                <Phone size={11} />
                                <span>{s.phone}</span>
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          <div className="space-y-0.5">
                            <span className="font-semibold block text-gray-900">
                              {s.department_name || `Dept #${s.department_id}`}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              Year: {s.year_name || s.year_id || "1"} | Sec:{" "}
                              {s.section_name || s.section_id || "A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(s)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-red-100 text-red-800 hover:bg-red-200 border border-red-300"
                            }`}
                            title="Click to toggle status"
                          >
                            {isActive ? (
                              <CheckCircle2 size={11} className="text-emerald-700" />
                            ) : (
                              <X size={11} className="text-red-700" />
                            )}
                            <span>{isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudent(s);
                                setIsViewModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                              title="View Student Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(s)}
                              className="p-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 transition cursor-pointer"
                              title="Edit Student"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStudentToDelete(s);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Student Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Enroll New Student"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Student ID / Roll Number *
              </label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value.toUpperCase() })
                }
                placeholder="e.g. 21CS001"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="student@college.com"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 555-0199"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
            </div>

            {/* Department / Year / Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  <option value="">Select Dept</option>
                  {departments.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Academic Year *
                </label>
                <select
                  required
                  value={formYearId}
                  onChange={(e) => setFormYearId(e.target.value)}
                  disabled={!formDeptId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 disabled:opacity-50"
                >
                  <option value="">Select Year</option>
                  {formDeptYears.map((y) => (
                    <option key={y.id} value={String(y.id)}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  required
                  value={formSectionId}
                  onChange={(e) => setFormSectionId(e.target.value)}
                  disabled={!formYearId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {formYearSections.map((sec) => (
                    <option key={sec.id} value={String(sec.id)}>
                      Section {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {createLoading ? "Enrolling..." : "Enroll Student"}
              </button>
            </div>
          </form>
        </Modal>

        {/* View Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Student Profile & Enrollment Record"
        >
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-purple-50/70 border border-purple-100 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-black text-base flex items-center justify-center shrink-0 uppercase shadow-2xs">
                  {(selectedStudent.full_name || selectedStudent.name || "S").charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    {selectedStudent.full_name || selectedStudent.name}
                  </h3>
                  <p className="font-mono text-xs font-bold text-purple-700">
                    Roll: {selectedStudent.student_id || selectedStudent.studentId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Email</p>
                  <p className="font-semibold text-gray-900 truncate mt-0.5">
                    {selectedStudent.email}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Phone</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedStudent.phone || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Department</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedStudent.department_name || `Dept #${selectedStudent.department_id}`}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Year & Section</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedStudent.year_name || selectedStudent.year_id || "1"} (Sec{" "}
                    {selectedStudent.section_name || selectedStudent.section_id || "A"})
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Student Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Student Information"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={editFormData.fullName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fullName: e.target.value })
                }
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={editFormData.departmentId}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, departmentId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  <option value="">Select Dept</option>
                  {departments.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  required
                  value={editFormData.yearId}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, yearId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  <option value="">Select Year</option>
                  {editDeptYears.map((y) => (
                    <option key={y.id} value={String(y.id)}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  required
                  value={editFormData.sectionId}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, sectionId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  <option value="">Select Section</option>
                  {editYearSections.map((sec) => (
                    <option key={sec.id} value={String(sec.id)}>
                      Section {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Student Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Student Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
              <AlertTriangle size={24} className="text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-900">
                  Are you sure you want to permanently delete this student?
                </p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  {studentToDelete?.full_name || studentToDelete?.name} (Roll:{" "}
                  {studentToDelete?.student_id || studentToDelete?.studentId}). This action cannot
                  be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteSubmit}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? "Deleting..." : "Delete Student"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </SuperAdminLayout>
  );
}
