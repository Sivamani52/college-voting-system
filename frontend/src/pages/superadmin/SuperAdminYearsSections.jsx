import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Layers,
  Building2,
  Calendar,
  Search,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Filter,
  AlertTriangle,
  FolderTree,
} from "lucide-react";
import toast from "react-hot-toast";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import {
  getAcademicStructure,
  getAllDepartments,
  getYears,
  createYear,
  updateYear,
  deleteYear,
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../../services/departmentService";

export default function SuperAdminYearsSections() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [structure, setStructure] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [error, setError] = useState(null);

  // Add Year Modal State
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [yearFormData, setYearFormData] = useState({ departmentId: "", name: "" });
  const [yearSubmitting, setYearSubmitting] = useState(false);

  // Edit Year Modal State
  const [isEditYearModalOpen, setIsEditYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [editYearName, setEditYearName] = useState("");
  const [yearUpdating, setYearUpdating] = useState(false);

  // Delete Year Modal State
  const [isDeleteYearModalOpen, setIsDeleteYearModalOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState(null);
  const [yearDeleting, setYearDeleting] = useState(false);

  // Add Section Modal State
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    departmentId: "",
    yearId: "",
    name: "",
  });
  const [sectionSubmitting, setSectionSubmitting] = useState(false);

  // Edit Section Modal State
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editSectionName, setEditSectionName] = useState("");
  const [sectionUpdating, setSectionUpdating] = useState(false);

  // Delete Section Modal State
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [sectionDeleting, setSectionDeleting] = useState(false);

  const loadData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [treeRes, deptsRes] = await Promise.all([
        getAcademicStructure(),
        getAllDepartments().catch(() => ({ departments: [] })),
      ]);

      const tree = treeRes.structure || treeRes.data || (Array.isArray(treeRes) ? treeRes : []);
      const dList = deptsRes.departments || deptsRes.data || (Array.isArray(deptsRes) ? deptsRes : []);

      setStructure(tree);
      setDepartments(dList);
    } catch (err) {
      console.error("Fetch academic structure error:", err);
      const msg = err.response?.data?.message || "Failed to load academic structure.";
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
      setIsAddYearModalOpen(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Year Handlers
  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!yearFormData.departmentId || !yearFormData.name.trim()) {
      toast.error("Please select a department and enter the year name.");
      return;
    }

    try {
      setYearSubmitting(true);
      await createYear({
        departmentId: Number(yearFormData.departmentId),
        name: yearFormData.name.trim(),
      });
      toast.success("Academic year created successfully!");
      setIsAddYearModalOpen(false);
      setYearFormData({ departmentId: "", name: "" });
      loadData(true);
    } catch (err) {
      console.error("Create year error:", err);
      toast.error(err.response?.data?.message || "Failed to create academic year.");
    } finally {
      setYearSubmitting(false);
    }
  };

  const handleOpenEditYear = (year) => {
    setEditingYear(year);
    setEditYearName(year.name || "");
    setIsEditYearModalOpen(true);
  };

  const handleUpdateYear = async (e) => {
    e.preventDefault();
    if (!editingYear || !editYearName.trim()) return;

    try {
      setYearUpdating(true);
      await updateYear(editingYear.id, { name: editYearName.trim() });
      toast.success("Academic year updated successfully!");
      setIsEditYearModalOpen(false);
      setEditingYear(null);
      loadData(true);
    } catch (err) {
      console.error("Update year error:", err);
      toast.error(err.response?.data?.message || "Failed to update academic year.");
    } finally {
      setYearUpdating(false);
    }
  };

  const handleConfirmDeleteYear = async () => {
    if (!yearToDelete) return;
    try {
      setYearDeleting(true);
      await deleteYear(yearToDelete.id);
      toast.success(`Academic year "${yearToDelete.name}" deleted!`);
      setIsDeleteYearModalOpen(false);
      setYearToDelete(null);
      loadData(true);
    } catch (err) {
      console.error("Delete year error:", err);
      toast.error(err.response?.data?.message || "Failed to delete academic year.");
    } finally {
      setYearDeleting(false);
    }
  };

  // Section Handlers
  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!sectionFormData.yearId || !sectionFormData.name.trim()) {
      toast.error("Please select an academic year and section name.");
      return;
    }

    try {
      setSectionSubmitting(true);
      await createSection({
        yearId: Number(sectionFormData.yearId),
        name: sectionFormData.name.trim(),
      });
      toast.success("Section created successfully!");
      setIsAddSectionModalOpen(false);
      setSectionFormData({ departmentId: "", yearId: "", name: "" });
      loadData(true);
    } catch (err) {
      console.error("Create section error:", err);
      toast.error(err.response?.data?.message || "Failed to create section.");
    } finally {
      setSectionSubmitting(false);
    }
  };

  const handleOpenEditSection = (sec) => {
    setEditingSection(sec);
    setEditSectionName(sec.name || "");
    setIsEditSectionModalOpen(true);
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    if (!editingSection || !editSectionName.trim()) return;

    try {
      setSectionUpdating(true);
      await updateSection(editingSection.id, { name: editSectionName.trim() });
      toast.success("Section updated successfully!");
      setIsEditSectionModalOpen(false);
      setEditingSection(null);
      loadData(true);
    } catch (err) {
      console.error("Update section error:", err);
      toast.error(err.response?.data?.message || "Failed to update section.");
    } finally {
      setSectionUpdating(false);
    }
  };

  const handleConfirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    try {
      setSectionDeleting(true);
      await deleteSection(sectionToDelete.id);
      toast.success(`Section "${sectionToDelete.name}" deleted!`);
      setIsDeleteSectionModalOpen(false);
      setSectionToDelete(null);
      loadData(true);
    } catch (err) {
      console.error("Delete section error:", err);
      toast.error(err.response?.data?.message || "Failed to delete section.");
    } finally {
      setSectionDeleting(false);
    }
  };

  // Available years for section creation dependent on selected department
  const availableYearsForSection =
    structure.find((d) => String(d.id || d.department_id) === String(sectionFormData.departmentId))
      ?.years || [];

  // Filter structure
  const filteredStructure = structure.filter((dept) => {
    const deptId = String(dept.id || dept.department_id);
    const matchesDept = selectedDeptFilter === "ALL" || deptId === selectedDeptFilter;
    const nameStr = (dept.department_name || dept.name || "").toLowerCase();
    const codeStr = (dept.department_code || dept.code || "").toLowerCase();
    const matchesSearch =
      nameStr.includes(searchQuery.toLowerCase()) || codeStr.includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-purple-700 to-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
              <FolderTree size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Years & Academic Sections
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Department &rarr; Academic Year &rarr; Section Class hierarchy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
              onClick={() => setIsAddYearModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Year</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddSectionModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Section</span>
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by department name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="deptFilter" className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0">
              <Filter size={14} /> Department:
            </label>
            <select
              id="deptFilter"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
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

        {/* Academic Hierarchy Accordion / Cards */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-medium">Loading academic structure tree...</p>
          </div>
        ) : filteredStructure.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
            <EmptyState
              icon={<Layers size={32} />}
              title="No academic structure records found"
              message="Create an academic year under a department to initialize the hierarchy."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStructure.map((dept) => (
              <div
                key={dept.id || dept.department_id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden"
              >
                {/* Department Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50/50 via-slate-50/50 to-transparent border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-gray-900">
                          {dept.name || dept.department_name}
                        </h2>
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                          {dept.code || dept.department_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {dept.years?.length || 0} Academic Year(s) enrolled
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setYearFormData({
                        departmentId: String(dept.id || dept.department_id),
                        name: "",
                      });
                      setIsAddYearModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition border border-purple-200 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Year</span>
                  </button>
                </div>

                {/* Years & Sections Content */}
                <div className="p-4 sm:p-5">
                  {!dept.years || dept.years.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400 italic">
                      No academic years configured for this department. Click &quot;Add Year&quot; to begin.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dept.years.map((year) => (
                        <div
                          key={year.id}
                          className="rounded-2xl border border-gray-200/80 bg-slate-50/60 p-4 space-y-3 hover:border-purple-200 transition"
                        >
                          {/* Year Header */}
                          <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                            <div className="flex items-center gap-2">
                              <Calendar size={15} className="text-purple-600 shrink-0" />
                              <h3 className="font-extrabold text-xs text-gray-900">{year.name}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditYear(year)}
                                className="p-1 rounded-lg hover:bg-white text-gray-500 hover:text-purple-700 transition"
                                title="Edit Year Name"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setYearToDelete(year);
                                  setIsDeleteYearModalOpen(true);
                                }}
                                className="p-1 rounded-lg hover:bg-white text-gray-500 hover:text-red-600 transition"
                                title="Delete Year"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Sections List */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Sections ({year.sections?.length || 0})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSectionFormData({
                                    departmentId: String(dept.id || dept.department_id),
                                    yearId: String(year.id),
                                    name: "",
                                  });
                                  setIsAddSectionModalOpen(true);
                                }}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <Plus size={11} />
                                <span>Add Section</span>
                              </button>
                            </div>

                            {!year.sections || year.sections.length === 0 ? (
                              <p className="text-[11px] text-gray-400 italic">No sections created.</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {year.sections.map((sec) => (
                                  <div
                                    key={sec.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 shadow-2xs group"
                                  >
                                    <span>Section {sec.name}</span>
                                    <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditSection(sec)}
                                        className="hover:text-purple-600 cursor-pointer"
                                        title="Rename Section"
                                      >
                                        <Edit2 size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSectionToDelete(sec);
                                          setIsDeleteSectionModalOpen(true);
                                        }}
                                        className="hover:text-red-600 cursor-pointer"
                                        title="Delete Section"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Year Modal */}
        <Modal
          isOpen={isAddYearModalOpen}
          onClose={() => setIsAddYearModalOpen(false)}
          title="Add Academic Year"
        >
          <form onSubmit={handleCreateYear} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Select Department *
              </label>
              <select
                required
                value={yearFormData.departmentId}
                onChange={(e) =>
                  setYearFormData({ ...yearFormData, departmentId: e.target.value })
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

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Year Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1st Year, 2nd Year, Final Year"
                value={yearFormData.name}
                onChange={(e) =>
                  setYearFormData({ ...yearFormData, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddYearModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={yearSubmitting}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {yearSubmitting ? "Creating..." : "Save Year"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Year Modal */}
        <Modal
          isOpen={isEditYearModalOpen}
          onClose={() => {
            setIsEditYearModalOpen(false);
            setEditingYear(null);
          }}
          title="Edit Academic Year Name"
        >
          <form onSubmit={handleUpdateYear} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Year Name *
              </label>
              <input
                type="text"
                required
                value={editYearName}
                onChange={(e) => setEditYearName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditYearModalOpen(false);
                  setEditingYear(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={yearUpdating}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {yearUpdating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Year Modal */}
        <Modal
          isOpen={isDeleteYearModalOpen}
          onClose={() => {
            setIsDeleteYearModalOpen(false);
            setYearToDelete(null);
          }}
          title="Confirm Delete Academic Year"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-900">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Cascade Deletion Warning</p>
                <p className="text-red-700 leading-relaxed">
                  Are you sure you want to delete year <strong>&quot;{yearToDelete?.name}&quot;</strong>?
                  All associated sections will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteYearModalOpen(false);
                  setYearToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteYear}
                disabled={yearDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {yearDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Add Section Modal */}
        <Modal
          isOpen={isAddSectionModalOpen}
          onClose={() => setIsAddSectionModalOpen(false)}
          title="Add Section"
        >
          <form onSubmit={handleCreateSection} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Department *
              </label>
              <select
                required
                value={sectionFormData.departmentId}
                onChange={(e) =>
                  setSectionFormData({
                    ...sectionFormData,
                    departmentId: e.target.value,
                    yearId: "",
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

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Academic Year *
              </label>
              <select
                required
                disabled={!sectionFormData.departmentId}
                value={sectionFormData.yearId}
                onChange={(e) =>
                  setSectionFormData({ ...sectionFormData, yearId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 disabled:opacity-50"
              >
                <option value="">-- Choose Year --</option>
                {availableYearsForSection.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Section Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A, B, C or Alpha"
                value={sectionFormData.name}
                onChange={(e) =>
                  setSectionFormData({ ...sectionFormData, name: e.target.value.toUpperCase() })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddSectionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sectionSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {sectionSubmitting ? "Creating..." : "Save Section"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Section Modal */}
        <Modal
          isOpen={isEditSectionModalOpen}
          onClose={() => {
            setIsEditSectionModalOpen(false);
            setEditingSection(null);
          }}
          title="Edit Section Name"
        >
          <form onSubmit={handleUpdateSection} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Section Name *
              </label>
              <input
                type="text"
                required
                value={editSectionName}
                onChange={(e) => setEditSectionName(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditSectionModalOpen(false);
                  setEditingSection(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sectionUpdating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {sectionUpdating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Section Modal */}
        <Modal
          isOpen={isDeleteSectionModalOpen}
          onClose={() => {
            setIsDeleteSectionModalOpen(false);
            setSectionToDelete(null);
          }}
          title="Confirm Delete Section"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-900">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Delete Section Warning</p>
                <p className="text-red-700 leading-relaxed">
                  Are you sure you want to delete section <strong>&quot;{sectionToDelete?.name}&quot;</strong>?
                  Students currently placed in this section will need to be reassigned.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteSectionModalOpen(false);
                  setSectionToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSection}
                disabled={sectionDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {sectionDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </SuperAdminLayout>
  );
}
