import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UserCheck,
  Search,
  Plus,
  RefreshCw,
  Mail,
  Building2,
  Edit2,
  Trash2,
  Eye,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
} from "../../services/electionService";
import {
  getAllDepartments,
  getYears,
  getSections,
} from "../../services/departmentService";

export default function SuperAdminAdmins() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [error, setError] = useState(null);

  // Add Admin State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    departmentId: "",
    yearId: "",
    sectionId: "",
  });

  // Edit Admin State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    departmentId: "",
    yearId: "",
    sectionId: "",
  });
  const [updating, setUpdating] = useState(false);

  // View Admin State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState(null);

  // Delete Admin State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [adminsRes, deptsRes, yearsRes, secRes] = await Promise.all([
        getAllAdmins().catch(() => ({ admins: [] })),
        getAllDepartments().catch(() => ({ departments: [] })),
        getYears().catch(() => ({ years: [] })),
        getSections().catch(() => ({ sections: [] })),
      ]);

      const aList = adminsRes.admins || adminsRes.data || (Array.isArray(adminsRes) ? adminsRes : []);
      const dList = deptsRes.departments || deptsRes.data || (Array.isArray(deptsRes) ? deptsRes : []);
      const yList = yearsRes.years || yearsRes.data || (Array.isArray(yearsRes) ? yearsRes : []);
      const sList = secRes.sections || secRes.data || (Array.isArray(secRes) ? secRes : []);

      setAdmins(aList);
      setDepartments(dList);
      setAllYears(yList);
      setAllSections(sList);
    } catch (err) {
      console.error("Fetch admins error:", err);
      const msg = err.response?.data?.message || "Failed to load administrators.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Support ?action=add
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsAddModalOpen(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.departmentId) {
      toast.error("Please fill in all required fields (Name, Email, Department).");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAdmin({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        departmentId: Number(formData.departmentId),
        yearId: formData.yearId ? Number(formData.yearId) : null,
        sectionId: formData.sectionId ? Number(formData.sectionId) : null,
      });

      toast.success(
        res?.temporaryPassword
          ? `Administrator registered! Temp Password: ${res.temporaryPassword}`
          : "Administrator registered successfully!"
      );
      setIsAddModalOpen(false);
      setFormData({ name: "", email: "", departmentId: "", yearId: "", sectionId: "" });
      loadData(true);
    } catch (err) {
      console.error("Create admin error:", err);
      toast.error(err.response?.data?.message || "Failed to create administrator.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      name: admin.full_name || admin.name || "",
      departmentId: String(admin.department_id || ""),
      yearId: admin.year_id ? String(admin.year_id) : "",
      sectionId: admin.section_id ? String(admin.section_id) : "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    if (!editFormData.name.trim() || !editFormData.departmentId) {
      toast.error("Name and Department are required.");
      return;
    }

    try {
      setUpdating(true);
      await updateAdmin(editingAdmin.id, {
        name: editFormData.name.trim(),
        departmentId: Number(editFormData.departmentId),
        yearId: editFormData.yearId ? Number(editFormData.yearId) : null,
        sectionId: editFormData.sectionId ? Number(editFormData.sectionId) : null,
      });

      toast.success("Administrator details updated successfully!");
      setIsEditModalOpen(false);
      setEditingAdmin(null);
      loadData(true);
    } catch (err) {
      console.error("Update admin error:", err);
      toast.error(err.response?.data?.message || "Failed to update administrator.");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const currentStatus = admin.status || admin.user_status || "ACTIVE";
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await toggleAdminStatus(admin.id, nextStatus);
      toast.success(`Admin marked as ${nextStatus}!`);
      loadData(true);
    } catch (err) {
      console.error("Toggle admin status error:", err);
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      setDeleting(true);
      await deleteAdmin(adminToDelete.id);
      toast.success("Administrator removed successfully!");
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
      loadData(true);
    } catch (err) {
      console.error("Delete admin error:", err);
      toast.error(err.response?.data?.message || "Failed to delete administrator.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Years for form based on selected department
  const formYears = formData.departmentId
    ? allYears.filter((y) => String(y.department_id) === String(formData.departmentId))
    : [];

  const formSections = formData.yearId
    ? allSections.filter((s) => String(s.year_id) === String(formData.yearId))
    : [];

  const editFormYears = editFormData.departmentId
    ? allYears.filter((y) => String(y.department_id) === String(editFormData.departmentId))
    : [];

  const editFormSections = editFormData.yearId
    ? allSections.filter((s) => String(s.year_id) === String(editFormData.yearId))
    : [];

  // Filter admins
  const filteredAdmins = admins.filter((a) => {
    const matchesDept =
      deptFilter === "ALL" || String(a.department_id) === deptFilter;
    const nameStr = (a.full_name || a.name || "").toLowerCase();
    const emailStr = (a.email || "").toLowerCase();
    const deptStr = (a.department_name || a.departmentName || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      nameStr.includes(query) || emailStr.includes(query) || deptStr.includes(query);

    return matchesDept && matchesSearch;
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-purple-700 to-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
              <UserCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Department Administrators
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Faculty officers with administrative delegation over student rosters and elections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Administrator</span>
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="deptAdminFilter" className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0">
              <Filter size={14} /> Department:
            </label>
            <select
              id="deptAdminFilter"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500 font-medium">Loading administrators...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<UserCheck size={32} />}
                title="No administrators found"
                message="Click &quot;Add Administrator&quot; to assign faculty admin credentials."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department & Scope</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredAdmins.map((admin) => {
                    const statusStr = admin.status || admin.user_status || "ACTIVE";
                    const isActive = statusStr === "ACTIVE";

                    return (
                      <tr key={admin.id} className="hover:bg-gray-50/60 transition">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {(admin.full_name || admin.name || "A").charAt(0)}
                            </div>
                            <span className="font-bold">{admin.full_name || admin.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Mail size={13} className="text-gray-400" />
                            <span>{admin.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Building2 size={13} className="text-purple-600" />
                              <span>{admin.department_name || `Dept #${admin.department_id}`}</span>
                            </div>
                            {(admin.year_name || admin.section_name) && (
                              <p className="text-[10px] text-gray-400">
                                {admin.year_name ? `Year: ${admin.year_name}` : ""}
                                {admin.section_name ? ` | Sec: ${admin.section_name}` : ""}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(admin)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border transition cursor-pointer ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                            title="Click to toggle active/inactive"
                          >
                            {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                            <span>{statusStr}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingAdmin(admin);
                                setIsViewModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                              title="View Admin Profile"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(admin)}
                              className="p-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 transition cursor-pointer"
                              title="Edit Admin"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminToDelete(admin);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete Admin"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Admin Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Department Administrator"
        >
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Alan Turing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. alanturing@college.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Department Assignment *
              </label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departmentId: e.target.value,
                    yearId: "",
                    sectionId: "",
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Year Scope (Optional)
                </label>
                <select
                  disabled={!formData.departmentId}
                  value={formData.yearId}
                  onChange={(e) =>
                    setFormData({ ...formData, yearId: e.target.value, sectionId: "" })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 disabled:opacity-50"
                >
                  <option value="">All Years</option>
                  {formYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Section Scope (Optional)
                </label>
                <select
                  disabled={!formData.yearId}
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 disabled:opacity-50"
                >
                  <option value="">All Sections</option>
                  {formSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              * A temporary password will be auto-generated and emailed via Brevo. The admin will be prompted to set a permanent password upon first login.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Registering..." : "Register Admin"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Admin Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAdmin(null);
          }}
          title="Edit Administrator"
        >
          <form onSubmit={handleUpdateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Department Assignment *
              </label>
              <select
                required
                value={editFormData.departmentId}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    departmentId: e.target.value,
                    yearId: "",
                    sectionId: "",
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Year Scope (Optional)
                </label>
                <select
                  disabled={!editFormData.departmentId}
                  value={editFormData.yearId}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, yearId: e.target.value, sectionId: "" })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 disabled:opacity-50"
                >
                  <option value="">All Years</option>
                  {editFormYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Section Scope (Optional)
                </label>
                <select
                  disabled={!editFormData.yearId}
                  value={editFormData.sectionId}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, sectionId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 disabled:opacity-50"
                >
                  <option value="">All Sections</option>
                  {editFormSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAdmin(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* View Admin Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingAdmin(null);
          }}
          title="Administrator Profile"
        >
          {viewingAdmin && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-purple-950">
                    {viewingAdmin.full_name || viewingAdmin.name}
                  </h3>
                  <p className="font-mono text-xs text-purple-700 mt-0.5">
                    {viewingAdmin.email}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700 border border-purple-200">
                  <ShieldCheck size={11} /> ADMIN
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-gray-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Department</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {viewingAdmin.department_name || `Dept #${viewingAdmin.department_id}`}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Status</p>
                  <p className="font-bold text-emerald-700 mt-0.5">
                    {viewingAdmin.status || viewingAdmin.user_status || "ACTIVE"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Year Scope</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {viewingAdmin.year_name || "All Years"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Section Scope</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {viewingAdmin.section_name ? `Section ${viewingAdmin.section_name}` : "All Sections"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setAdminToDelete(null);
          }}
          title="Confirm Administrator Removal"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-900">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Permanent Account Revocation</p>
                <p className="text-red-700 leading-relaxed">
                  Are you sure you want to remove administrator{" "}
                  <strong>&quot;{adminToDelete?.full_name || adminToDelete?.name}&quot;</strong> ({adminToDelete?.email})?
                  This will revoke their portal access immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAdminToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </SuperAdminLayout>
  );
}
