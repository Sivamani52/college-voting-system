import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Vote,
  Search,
  Plus,
  RefreshCw,
  Trophy,
  Calendar,
  Filter,
  Eye,
  Trash2,
  PlayCircle,
  StopCircle,
  Award,
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import {
  getAllElections,
  getElectionById,
  createElection,
  updateElectionStatus,
  deleteElection,
  getPositionsByElection,
  createPosition,
  getCandidatesByElection,
  createCandidate,
  getEligibleVotersByElection,
  addEligibleVoter,
  addBulkEligibleVoters,
  getAllStudents,
} from "../../services/electionService";
import { getAllDepartments } from "../../services/departmentService";

export default function SuperAdminElections() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState(null);

  // Create Election Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // View/Manage Election Details Modal State
  const [selectedElection, setSelectedElection] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [eligibleVoters, setEligibleVoters] = useState([]);
  const [activeTab, setActiveTab] = useState("POSITIONS"); // POSITIONS, CANDIDATES, VOTERS

  // Add Position State
  const [newPositionName, setNewPositionName] = useState("");
  const [newPositionDesc, setNewPositionDesc] = useState("");
  const [addingPosition, setAddingPosition] = useState(false);

  // Add Candidate State
  const [candPositionId, setCandPositionId] = useState("");
  const [candStudentId, setCandStudentId] = useState("");
  const [candManifesto, setCandManifesto] = useState("");
  const [addingCandidate, setAddingCandidate] = useState(false);

  // Add Voter State
  const [allStudents, setAllStudents] = useState([]);
  const [voterStudentId, setVoterStudentId] = useState("");
  const [addingVoter, setAddingVoter] = useState(false);
  const [bulkEnrolling, setBulkEnrolling] = useState(false);

  // Delete Election Confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [electionToDelete, setElectionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadElections = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await getAllElections();
      const list = res.elections || res.data || (Array.isArray(res) ? res : []);
      setElections(list);
    } catch (err) {
      console.error("Fetch elections error:", err);
      const msg = err.response?.data?.message || "Failed to load elections.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  // Support ?action=add
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsAddModalOpen(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreateElection = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please provide an election title.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createElection({
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate || new Date().toISOString(),
        endDate:
          formData.endDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      toast.success("Election created successfully!");
      setIsAddModalOpen(false);
      setFormData({ title: "", description: "", startDate: "", endDate: "" });
      loadElections(true);

      // Auto open details to add positions
      if (res.electionId) {
        handleOpenDetails({ id: res.electionId, title: formData.title });
      }
    } catch (err) {
      console.error("Create election error:", err);
      toast.error(err.response?.data?.message || "Failed to create election.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetails = async (election) => {
    setSelectedElection(election);
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);

    try {
      const [posRes, candRes, votersRes, studentsRes] = await Promise.all([
        getPositionsByElection(election.id).catch(() => ({ positions: [] })),
        getCandidatesByElection(election.id).catch(() => ({ candidates: [] })),
        getEligibleVotersByElection(election.id).catch(() => ({ eligibleVoters: [] })),
        getAllStudents().catch(() => ({ students: [] })),
      ]);

      setPositions(posRes.positions || posRes.data || (Array.isArray(posRes) ? posRes : []));
      setCandidates(candRes.candidates || candRes.data || (Array.isArray(candRes) ? candRes : []));
      setEligibleVoters(votersRes.eligibleVoters || votersRes.data || (Array.isArray(votersRes) ? votersRes : []));
      setAllStudents(studentsRes.students || studentsRes.data || (Array.isArray(studentsRes) ? studentsRes : []));
    } catch (err) {
      console.error("Load election details error:", err);
      toast.error("Failed to load full election details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus) => {
    if (!selectedElection) return;
    try {
      await updateElectionStatus(selectedElection.id, targetStatus);
      toast.success(`Election status transitioned to ${targetStatus}!`);
      setSelectedElection({ ...selectedElection, status: targetStatus });
      loadElections(true);
    } catch (err) {
      console.error("Status transition error:", err);
      toast.error(err.response?.data?.message || `Failed to transition to ${targetStatus}.`);
    }
  };

  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!newPositionName.trim()) return;

    try {
      setAddingPosition(true);
      await createPosition({
        electionId: selectedElection.id,
        name: newPositionName.trim(),
        description: newPositionDesc.trim() || null,
      });

      toast.success(`Position "${newPositionName}" added!`);
      setNewPositionName("");
      setNewPositionDesc("");

      const posRes = await getPositionsByElection(selectedElection.id);
      setPositions(posRes.positions || posRes.data || []);
    } catch (err) {
      console.error("Add position error:", err);
      toast.error(err.response?.data?.message || "Failed to add position.");
    } finally {
      setAddingPosition(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candPositionId || !candStudentId) {
      toast.error("Please select both a position and a candidate student.");
      return;
    }

    try {
      setAddingCandidate(true);
      await createCandidate({
        electionId: selectedElection.id,
        positionId: Number(candPositionId),
        studentId: Number(candStudentId),
        manifesto: candManifesto.trim() || null,
      });

      toast.success("Candidate nominated successfully!");
      setCandPositionId("");
      setCandStudentId("");
      setCandManifesto("");

      const candRes = await getCandidatesByElection(selectedElection.id);
      setCandidates(candRes.candidates || candRes.data || []);
    } catch (err) {
      console.error("Add candidate error:", err);
      toast.error(err.response?.data?.message || "Failed to add candidate.");
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleAddSingleVoter = async (e) => {
    e.preventDefault();
    if (!voterStudentId) return;

    try {
      setAddingVoter(true);
      await addEligibleVoter({
        electionId: selectedElection.id,
        studentId: Number(voterStudentId),
      });

      toast.success("Student enrolled into voter roll!");
      setVoterStudentId("");

      const votersRes = await getEligibleVotersByElection(selectedElection.id);
      setEligibleVoters(votersRes.eligibleVoters || votersRes.data || []);
    } catch (err) {
      console.error("Add voter error:", err);
      toast.error(err.response?.data?.message || "Failed to enroll voter.");
    } finally {
      setAddingVoter(false);
    }
  };

  const handleBulkEnrollAllStudents = async () => {
    if (!selectedElection) return;
    try {
      setBulkEnrolling(true);
      const studentIds = allStudents.map((s) => s.id);
      if (studentIds.length === 0) {
        toast.error("No registered students found in database.");
        return;
      }

      await addBulkEligibleVoters({
        electionId: selectedElection.id,
        studentIds,
      });

      toast.success(`Enrolled ${studentIds.length} eligible students into ballot roll!`);
      const votersRes = await getEligibleVotersByElection(selectedElection.id);
      setEligibleVoters(votersRes.eligibleVoters || votersRes.data || []);
    } catch (err) {
      console.error("Bulk enroll error:", err);
      toast.error(err.response?.data?.message || "Failed to bulk enroll voters.");
    } finally {
      setBulkEnrolling(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!electionToDelete) return;
    try {
      setDeleting(true);
      await deleteElection(electionToDelete.id);
      toast.success("Election deleted successfully!");
      setIsDeleteModalOpen(false);
      setElectionToDelete(null);
      loadElections(true);
    } catch (err) {
      console.error("Delete election error:", err);
      toast.error(err.response?.data?.message || "Failed to delete election.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredElections = elections.filter((e) => {
    const matchesSearch =
      (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "RESULT_PUBLISHED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CLOSED":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "UPCOMING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-purple-700 to-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
              <Vote size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Campus Elections Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Full governance of election sessions, candidates, voter franchises, and outcome publishing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadElections(true)}
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
              <span>Create Election</span>
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
              placeholder="Search elections by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="statusElecFilter" className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0">
              <Filter size={14} /> Status:
            </label>
            <select
              id="statusElecFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
              <option value="RESULT_PUBLISHED">RESULT_PUBLISHED</option>
            </select>
          </div>
        </div>

        {/* Elections Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500 font-medium">Loading elections...</p>
            </div>
          ) : filteredElections.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Vote size={32} />}
                title="No elections found"
                message="Click &quot;Create Election&quot; to begin a new voting process."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Election Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timeline</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredElections.map((elec) => (
                    <tr key={elec.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-purple-50 text-purple-700 rounded-xl shrink-0">
                            <Vote size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{elec.title}</span>
                            {elec.description && (
                              <p className="text-[11px] text-gray-400 line-clamp-1 max-w-sm mt-0.5">
                                {elec.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                            elec.status
                          )}`}
                        >
                          {elec.status || "DRAFT"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar size={13} className="text-gray-400" />
                          <span>
                            {elec.start_date || elec.startDate
                              ? new Date(elec.start_date || elec.startDate).toLocaleDateString()
                              : "TBD"}
                            {" — "}
                            {elec.end_date || elec.endDate
                              ? new Date(elec.end_date || elec.endDate).toLocaleDateString()
                              : "TBD"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(elec)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition border border-purple-200 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Manage / Details</span>
                          </button>

                          <Link
                            to={`/super-admin/elections/${elec.id}/results`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
                          >
                            <Trophy size={13} />
                            <span>Results</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setElectionToDelete(elec);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete Election"
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

        {/* Create Election Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Election"
        >
          <form onSubmit={handleCreateElection} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Election Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Student Council Election 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe election objectives, candidate rules, and procedures..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
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
                {submitting ? "Creating..." : "Save Election"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Election Details & Management Modal */}
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedElection(null);
          }}
          title={selectedElection?.title || "Election Administration"}
        >
          {detailsLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Loading election management data...
            </div>
          ) : selectedElection ? (
            <div className="space-y-5 text-xs">
              {/* Election Status Lifecycle Management */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-950">Current Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                        selectedElection.status
                      )}`}
                    >
                      {selectedElection.status || "DRAFT"}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700/80 mt-0.5">
                    Transition lifecycle: DRAFT &rarr; ACTIVE &rarr; CLOSED &rarr; RESULT_PUBLISHED
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedElection.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("ACTIVE")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                    >
                      <PlayCircle size={13} />
                      <span>Activate Election</span>
                    </button>
                  )}

                  {selectedElection.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("CLOSED")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] shadow-xs hover:bg-amber-700 transition cursor-pointer"
                    >
                      <StopCircle size={13} />
                      <span>Close Voting</span>
                    </button>
                  )}

                  {selectedElection.status === "CLOSED" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("RESULT_PUBLISHED")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-[11px] shadow-xs hover:bg-purple-700 transition cursor-pointer"
                    >
                      <Award size={13} />
                      <span>Publish Results</span>
                    </button>
                  )}

                  <Link
                    to={`/super-admin/elections/${selectedElection.id}/results`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] border border-purple-200 shadow-2xs transition"
                  >
                    <Trophy size={13} />
                    <span>View Tabulated Results</span>
                  </Link>
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("POSITIONS")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    activeTab === "POSITIONS"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Positions ({positions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("CANDIDATES")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    activeTab === "CANDIDATES"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Candidates ({candidates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("VOTERS")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    activeTab === "VOTERS"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Voters ({eligibleVoters.length})
                </button>
              </div>

              {/* TAB 1: POSITIONS */}
              {activeTab === "POSITIONS" && (
                <div className="space-y-4">
                  <form onSubmit={handleAddPosition} className="p-3 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                    <p className="font-bold text-gray-800">Add New Ballot Position</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Position name (e.g. President)"
                        value={newPositionName}
                        onChange={(e) => setNewPositionName(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Description (Optional)"
                        value={newPositionDesc}
                        onChange={(e) => setNewPositionDesc(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingPosition}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 transition disabled:opacity-50 cursor-pointer"
                    >
                      {addingPosition ? "Adding..." : "+ Add Position"}
                    </button>
                  </form>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {positions.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{p.name}</p>
                          {p.description && <p className="text-gray-500 text-[11px]">{p.description}</p>}
                        </div>
                      </div>
                    ))}
                    {positions.length === 0 && (
                      <p className="text-gray-400 italic">No positions created yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CANDIDATES */}
              {activeTab === "CANDIDATES" && (
                <div className="space-y-4">
                  <form onSubmit={handleAddCandidate} className="p-3 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                    <p className="font-bold text-gray-800">Nominate Candidate</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        required
                        value={candPositionId}
                        onChange={(e) => setCandPositionId(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      >
                        <option value="">-- Choose Position --</option>
                        {positions.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>

                      <select
                        required
                        value={candStudentId}
                        onChange={(e) => setCandStudentId(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      >
                        <option value="">-- Choose Student --</option>
                        {allStudents.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name} ({s.student_id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Candidate manifesto or pledge..."
                      value={candManifesto}
                      onChange={(e) => setCandManifesto(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />

                    <button
                      type="submit"
                      disabled={addingCandidate}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 transition disabled:opacity-50 cursor-pointer"
                    >
                      {addingCandidate ? "Saving..." : "+ Nominate Candidate"}
                    </button>
                  </form>

                  {/* Group candidates by position */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {positions.map((pos) => {
                      const posCandidates = candidates.filter((c) => c.position_id === pos.id);
                      return (
                        <div key={pos.id} className="p-2.5 rounded-xl border border-gray-100 bg-slate-50 space-y-1.5">
                          <p className="font-bold text-purple-900 uppercase text-[11px] tracking-wider">
                            {pos.name}
                          </p>
                          {posCandidates.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">No candidates nominated yet.</p>
                          ) : (
                            posCandidates.map((c) => (
                              <div
                                key={c.id}
                                className="p-2 rounded-lg bg-white border border-gray-200 flex items-center justify-between text-xs"
                              >
                                <span className="font-bold text-gray-800">{c.candidate_name || c.full_name}</span>
                                {c.manifesto && (
                                  <span className="text-[10px] text-gray-400 truncate max-w-xs">{c.manifesto}</span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: VOTERS */}
              {activeTab === "VOTERS" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-purple-50/70 rounded-2xl border border-purple-100">
                    <div>
                      <p className="font-bold text-purple-950">Voter Roll Management</p>
                      <p className="text-[11px] text-purple-700">
                        {eligibleVoters.length} of {allStudents.length} registered students enrolled
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkEnrollAllStudents}
                      disabled={bulkEnrolling}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {bulkEnrolling ? "Enrolling All..." : "Enroll All College Students"}
                    </button>
                  </div>

                  <form onSubmit={handleAddSingleVoter} className="flex items-center gap-2">
                    <select
                      value={voterStudentId}
                      onChange={(e) => setVoterStudentId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    >
                      <option value="">-- Enroll Single Student by Name/ID --</option>
                      {allStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.student_id}) - {s.email}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={addingVoter || !voterStudentId}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {addingVoter ? "Adding..." : "+ Enroll"}
                    </button>
                  </form>

                  <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl">
                    {eligibleVoters.slice(0, 50).map((v) => (
                      <div key={v.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50">
                        <span className="font-bold text-gray-800">{v.student_name || v.full_name}</span>
                        <span className="font-mono text-[11px] text-gray-500">{v.student_id_code || v.student_id}</span>
                      </div>
                    ))}
                    {eligibleVoters.length === 0 && (
                      <p className="p-4 text-center text-gray-400 italic">No voters enrolled yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setElectionToDelete(null);
          }}
          title="Confirm Election Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-900">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Permanent Election Removal</p>
                <p className="text-red-700 leading-relaxed">
                  Are you sure you want to delete election{" "}
                  <strong>&quot;{electionToDelete?.title}&quot;</strong>?
                  All associated positions, candidate nominations, voter enrollments, and cast votes will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setElectionToDelete(null);
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
