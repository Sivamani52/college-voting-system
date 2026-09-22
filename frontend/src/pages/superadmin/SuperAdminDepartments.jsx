import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Layers,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentService";

export default function SuperAdminDepartments() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Add Department State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", status: "ACTIVE" });

  // Edit Department State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", code: "", status: "ACTIVE" });
  const [updating, setUpdating] = useState(false);

  // View Department Details State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDept, setViewingDept] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadDepartments = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await getAllDepartments();
      const list = res.departments || res.data || (Array.isArray(res) ? res : []);
      setDepartments(list);
    } catch (err) {
      console.error("Fetch departments error:", err);
      const msg = err.response?.data?.message || "Failed to load departments.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  // Open Add modal if ?action=add
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsAddModalOpen(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Please provide both department name and code.");
      return;
    }

    try {
      setSubmitting(true);
      await createDepartment({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        status: formData.status || "ACTIVE",
      });
      toast.success("Department created successfully!");
      setIsAddModalOpen(false);
      setFormData({ name: "", code: "", status: "ACTIVE" });
      loadDepartments(true);
    } catch (err) {
      console.error("Create department error:", err);
      toast.error(err.response?.data?.message || "Failed to create department.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setEditFormData({
      name: dept.name || "",
      code: dept.code || "",
      status: dept.status || "ACTIVE",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    if (!editFormData.name.trim() || !editFormData.code.trim()) {
      toast.error("Department name and code are required.");
      return;
    }

    try {
      setUpdating(true);
      await updateDepartment(editingDept.id, {
        name: editFormData.name.trim(),
        code: editFormData.code.trim().toUpperCase(),
        status: editFormData.status,
      });
      toast.success("Department updated successfully!");
      setIsEditModalOpen(false);
      setEditingDept(null);
      loadDepartments(true);
    } catch (err) {
      console.error("Update department error:", err);
      toast.error(err.response?.data?.message || "Failed to update department.");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenView = async (dept) => {
    setIsViewModalOpen(true);
    setViewLoading(true);
    try {
      const res = await getDepartmentById(dept.id);
      setViewingDept(res.department || dept);
    } catch (err) {
      console.error("View department details error:", err);
      setViewingDept(dept);
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenDelete = (dept) => {
    setDeptToDelete(dept);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    try {
      setDeleting(true);
      await deleteDepartment(deptToDelete.id);
      toast.success(`Department "${deptToDelete.name}" deleted successfully!`);
      setIsDeleteModalOpen(false);
      setDeptToDelete(null);
      loadDepartments(true);
    } catch (err) {
      console.error("Delete department error:", err);
      toast.error(err.response?.data?.message || "Failed to delete department.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredDepartments = departments.filter(
    (d) =>
      (d.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-purple-700 to-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Academic Departments
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage university faculties, codes, academic branches, and student allocations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadDepartments(true)}
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
              <span>Add Department</span>
            </button>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onDismiss={() => setError(null)} />
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search departments by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
          </div>
        </div>

        {/* Department Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500 font-medium">Loading departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Building2 size={32} />}
                title="No departments found"
                message="Add your first department using the button above or clear your search."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Department Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total Students</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        {dept.code}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-gray-400 shrink-0" />
                          <span className="font-semibold">{dept.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            (dept.status || "ACTIVE") === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {dept.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono">
                        {dept.studentCount || dept.student_count || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenView(dept)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                            title="View Department Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(dept)}
                            className="p-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 transition cursor-pointer"
                            title="Edit Department"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(dept)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete Department"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Department Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Department"
        >
          <form onSubmit={handleCreateDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science and Engineering"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSE"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

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
                {submitting ? "Creating..." : "Save Department"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Department Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDept(null);
          }}
          title="Edit Department"
        >
          <form onSubmit={handleUpdateDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                required
                value={editFormData.code}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, status: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDept(null);
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

        {/* View Department Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingDept(null);
          }}
          title="Department Profile"
        >
          {viewLoading ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Loading department data...
            </div>
          ) : viewingDept ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-purple-950">
                    {viewingDept.name}
                  </h3>
                  <p className="font-mono text-xs font-bold text-purple-700 mt-0.5">
                    Faculty Code: {viewingDept.code}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    (viewingDept.status || "ACTIVE") === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {viewingDept.status || "ACTIVE"}
                </span>
              </div>

              {/* Linked Academic Years */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Layers size={14} className="text-purple-600" />
                  <span>Academic Years ({viewingDept.years?.length || 0})</span>
                </h4>
                {viewingDept.years && viewingDept.years.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {viewingDept.years.map((y) => (
                      <div
                        key={y.id}
                        className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 font-semibold"
                      >
                        <p className="font-bold text-gray-800">{y.name}</p>
                        <p className="text-[10px] text-gray-400">
                          Sections: {y.sections?.length || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No academic years added yet.</p>
                )}
              </div>

              {/* Linked Admins */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <UserCheck size={14} className="text-blue-600" />
                  <span>Assigned Administrators ({viewingDept.admins?.length || 0})</span>
                </h4>
                {viewingDept.admins && viewingDept.admins.length > 0 ? (
                  <div className="space-y-1.5">
                    {viewingDept.admins.map((adm) => (
                      <div
                        key={adm.id}
                        className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-gray-800">{adm.full_name || adm.name}</p>
                          <p className="text-[11px] text-gray-400">{adm.email}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          Admin
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No department admins assigned.</p>
                )}
              </div>
            </div>
          ) : null}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeptToDelete(null);
          }}
          title="Confirm Department Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-900">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Warning: This action cannot be undone</p>
                <p className="text-red-700 leading-relaxed">
                  Are you sure you want to delete department{" "}
                  <strong>&quot;{deptToDelete?.name}&quot;</strong> ({deptToDelete?.code})?
                  This will also cascade delete all associated academic years, sections, and assignments.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeptToDelete(null);
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
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </SuperAdminLayout>
  );
}
