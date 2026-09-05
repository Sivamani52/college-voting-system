import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Vote,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Users,
  UserPlus,
  Award,
  X,
  Plus,
  Trash2,
  Building2,
  AlertTriangle,
  PlayCircle,
  StopCircle,
  Share2,
  ArrowRight,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import Modal from "../../components/common/Modal";
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
  removeEligibleVoter,
  getElectionStats,
  getElectionResults,
} from "../../services/electionService";
import { getMyAdminProfile, getAllStudents } from "../../services/studentService";

// Standard Department Position Presets
const STANDARD_POSITIONS = [
  { name: "Department President", description: "Leads student council & represents department at academic board." },
  { name: "Vice President", description: "Assists the president and oversees internal student affairs." },
  { name: "General Secretary", description: "Coordinates events, symposia, and council communications." },
  { name: "Class Representative (CR)", description: "Liaison between class students, advisors, and faculty." },
  { name: "Technical Secretary", description: "Organizes coding hackathons, workshops, and tech fests." },
  { name: "Cultural Secretary", description: "Coordinates department cultural performances & celebrations." },
  { name: "Sports Secretary", description: "Leads department athletics and collegiate sports teams." },
  { name: "Treasurer", description: "Manages student association budgeting and financial accounts." },
];

export default function ElectionManagement() {
  const [elections, setElections] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [departmentStudents, setDepartmentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Election Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    autoEnrollDepartment: true,
  });
  const [positionsList, setPositionsList] = useState([
    { name: "Department President", description: "Leads student council & represents department at academic board." },
    { name: "General Secretary", description: "Coordinates events, symposia, and council communications." },
  ]);
  const [newPositionName, setNewPositionName] = useState("");
  const [newPositionDesc, setNewPositionDesc] = useState("");

  // Status Change Confirmation Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetElection, setStatusTargetElection] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  // Delete Confirmation Modal State
  const [electionToDelete, setElectionToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Election Details Modal State
  const [selectedElection, setSelectedElection] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("positions"); // "positions" | "candidates" | "voters" | "results"

  // Position Management inside Details
  const [isAddingPositionInline, setIsAddingPositionInline] = useState(false);
  const [inlinePosName, setInlinePosName] = useState("");
  const [inlinePosDesc, setInlinePosDesc] = useState("");
  const [addPosLoading, setAddPosLoading] = useState(false);

  // Candidate Nomination inside Details
  const [nominatingPositionId, setNominatingPositionId] = useState(null);
  const [candidateForm, setCandidateForm] = useState({
    studentId: "",
    manifesto: "",
    photoUrl: "",
  });
  const [nominateLoading, setNominateLoading] = useState(false);

  // Eligible Voter Management inside Details
  const [voterSearch, setVoterSearch] = useState("");
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");
  const [addVoterLoading, setAddVoterLoading] = useState(false);
  const [bulkVoterLoading, setBulkVoterLoading] = useState(false);
  const [deletingVoterId, setDeletingVoterId] = useState(null);

  // Details Data State
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [eligibleVoters, setEligibleVoters] = useState([]);
  const [turnoutStats, setTurnoutStats] = useState(null);
  const [resultsData, setResultsData] = useState(null);

  // Helper for formatting API errors
  const extractErrorMessage = (err, defaultMsg = "An unexpected error occurred.") => {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.message) return err.message;
    return defaultMsg;
  };

  // Fetch Admin Profile, Students & Elections List
  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const [electionsRes, profileRes, studentsRes] = await Promise.allSettled([
        getAllElections(),
        getMyAdminProfile(),
        getAllStudents(),
      ]);

      if (electionsRes.status === "fulfilled") {
        const list = Array.isArray(electionsRes.value)
          ? electionsRes.value
          : electionsRes.value?.elections || [];
        setElections(list);
      } else {
        throw new Error(extractErrorMessage(electionsRes.reason, "Failed to load elections"));
      }

      if (profileRes.status === "fulfilled") {
        setAdminProfile(profileRes.value?.admin || profileRes.value || null);
      }

      if (studentsRes.status === "fulfilled") {
        const sList = Array.isArray(studentsRes.value)
          ? studentsRes.value
          : studentsRes.value?.students || [];
        setDepartmentStudents(sList);
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to load election records.");
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
    const total = elections.length;
    const active = elections.filter(
      (e) => (e.status || "").toUpperCase() === "ACTIVE"
    ).length;
    const upcoming = elections.filter(
      (e) => (e.status || "").toUpperCase() === "UPCOMING"
    ).length;
    const closed = elections.filter(
      (e) =>
        (e.status || "").toUpperCase() === "CLOSED" ||
        (e.status || "").toUpperCase() === "RESULT_PUBLISHED"
    ).length;

    return { total, active, upcoming, closed };
  }, [elections]);

  // Filtered Elections
  const filteredElections = useMemo(() => {
    return elections.filter((election) => {
      // Status Filter
      const currentStatus = (election.status || "").toUpperCase();
      if (statusFilter !== "ALL" && currentStatus !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = (election.title || "").toLowerCase();
        const description = (election.description || "").toLowerCase();
        const idStr = String(election.id);

        return title.includes(query) || description.includes(query) || idStr.includes(query);
      }

      return true;
    });
  }, [elections, statusFilter, searchQuery]);

  // Date Formatting Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return String(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateString);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (rawStatus) => {
    const status = (rawStatus || "DRAFT").toUpperCase();
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Voting
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} className="text-blue-500" />
            Upcoming
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <CheckCircle2 size={12} className="text-gray-500" />
            Voting Closed
          </span>
        );
      case "RESULT_PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <BarChart3 size={12} className="text-purple-600" />
            Results Published
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FileText size={12} className="text-amber-600" />
            Draft
          </span>
        );
    }
  };

  // Open Create Election Modal
  const handleOpenCreateModal = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const formatForInput = (d) => {
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setElectionForm({
      title: "",
      description: "",
      startDate: formatForInput(tomorrow),
      endDate: formatForInput(nextWeek),
      autoEnrollDepartment: true,
    });
    setPositionsList([
      { name: "Department President", description: "Leads student council & represents department at academic board." },
      { name: "General Secretary", description: "Coordinates events, symposia, and council communications." },
    ]);
    setNewPositionName("");
    setNewPositionDesc("");
    setIsCreateModalOpen(true);
  };

  // Add Position Preset in Create Modal
  const handleAddPresetPosition = (preset) => {
    if (positionsList.some((p) => p.name.toLowerCase() === preset.name.toLowerCase())) {
      toast.error(`Position "${preset.name}" is already in the list.`);
      return;
    }
    setPositionsList([...positionsList, preset]);
  };

  // Add Custom Position in Create Modal
  const handleAddCustomPosition = () => {
    if (!newPositionName.trim()) {
      toast.error("Please enter a position name.");
      return;
    }
    if (positionsList.some((p) => p.name.toLowerCase() === newPositionName.trim().toLowerCase())) {
      toast.error(`Position "${newPositionName.trim()}" is already in the list.`);
      return;
    }
    setPositionsList([
      ...positionsList,
      { name: newPositionName.trim(), description: newPositionDesc.trim() || null },
    ]);
    setNewPositionName("");
    setNewPositionDesc("");
  };

  // Remove Position from Create Form List
  const handleRemovePosition = (index) => {
    setPositionsList(positionsList.filter((_, i) => i !== index));
  };

  // Handle Create Election Submission
  const handleCreateElectionSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!electionForm.title.trim()) {
      toast.error("Election Title is required.");
      return;
    }

    if (!electionForm.startDate || !electionForm.endDate) {
      toast.error("Start Date and End Date are required.");
      return;
    }

    const start = new Date(electionForm.startDate);
    const end = new Date(electionForm.endDate);

    if (end <= start) {
      toast.error("End Date must be after Start Date.");
      return;
    }

    setCreateLoading(true);
    try {
      // 1. Create Election Record
      const createRes = await createElection({
        title: electionForm.title.trim(),
        description: electionForm.description.trim() || undefined,
        startDate: electionForm.startDate,
        endDate: electionForm.endDate,
      });

      const electionId = createRes?.electionId || createRes?.id || createRes?.election?.id;

      // 2. Create Positions if defined
      if (electionId && positionsList.length > 0) {
        for (const pos of positionsList) {
          try {
            await createPosition({
              electionId,
              name: pos.name,
              description: pos.description || undefined,
            });
          } catch (posErr) {
            console.warn("Could not create initial position:", pos.name, posErr);
          }
        }
      }

      // 3. Auto-Enroll Department Students as Eligible Voters
      if (electionId && electionForm.autoEnrollDepartment) {
        try {
          await addBulkEligibleVoters({
            electionId,
            departmentId: adminProfile?.department_id,
            yearId: adminProfile?.year_id,
            sectionId: adminProfile?.section_id,
          });
        } catch (voterErr) {
          console.warn("Could not auto-enroll department voters:", voterErr);
        }
      }

      toast.success("Department election created successfully!");
      setIsCreateModalOpen(false);
      await loadData(false);
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to create election.");
      toast.error(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  // Open Status Change Dialog
  const handleRequestStatusChange = (election, nextStatus, e) => {
    if (e) e.stopPropagation();
    setStatusTargetElection(election);
    setTargetStatus(nextStatus);
    setStatusModalOpen(true);
  };

  // Confirm Status Change
  const handleConfirmStatusChange = async () => {
    if (!statusTargetElection || !targetStatus) return;

    setStatusChangeLoading(true);
    try {
      await updateElectionStatus(statusTargetElection.id, targetStatus);
      toast.success(`Election status transitioned to ${targetStatus}!`);
      setStatusModalOpen(false);

      // Refresh list and current inspection modal if open
      await loadData(false);
      if (selectedElection?.id === statusTargetElection.id) {
        const freshElection = await getElectionById(statusTargetElection.id);
        setSelectedElection(freshElection?.election || freshElection);
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to update election status.");
      toast.error(errorMsg);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Handle Delete Confirmation
  const handleOpenDeleteModal = (election, e) => {
    if (e) e.stopPropagation();
    setElectionToDelete(election);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!electionToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteElection(electionToDelete.id);
      toast.success(`Election "${electionToDelete.title}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setElectionToDelete(null);

      if (selectedElection?.id === electionToDelete.id) {
        setIsDetailsModalOpen(false);
        setSelectedElection(null);
      }

      await loadData(false);
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to delete election.");
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open Election Details
  const handleOpenDetails = async (election) => {
    setSelectedElection(election);
    setIsDetailsModalOpen(true);
    setActiveTab("positions");
    setNominatingPositionId(null);
    setIsAddingPositionInline(false);
    setVoterSearch("");
    setSelectedStudentToAdd("");
    setDetailsLoading(true);
    setPositions([]);
    setCandidates([]);
    setEligibleVoters([]);
    setTurnoutStats(null);
    setResultsData(null);

    try {
      const [posRes, candRes, votersRes, statsRes, resRes] =
        await Promise.allSettled([
          getPositionsByElection(election.id),
          getCandidatesByElection(election.id),
          getEligibleVotersByElection(election.id),
          getElectionStats(election.id),
          getElectionResults(election.id),
        ]);

      if (posRes.status === "fulfilled") {
        setPositions(posRes.value?.positions || posRes.value || []);
      }
      if (candRes.status === "fulfilled") {
        setCandidates(candRes.value?.candidates || candRes.value || []);
      }
      if (votersRes.status === "fulfilled") {
        setEligibleVoters(
          votersRes.value?.eligibleVoters ||
            votersRes.value?.voters ||
            votersRes.value ||
            []
        );
      }
      if (statsRes.status === "fulfilled") {
        setTurnoutStats(statsRes.value?.stats || statsRes.value || null);
      }
      if (resRes.status === "fulfilled") {
        setResultsData(resRes.value?.results || resRes.value || null);
      }
    } catch {
      toast.error("Some election details could not be loaded.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Add Position Inline (inside Details)
  const handleAddPositionInline = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inlinePosName.trim()) {
      toast.error("Position name is required.");
      return;
    }

    setAddPosLoading(true);
    try {
      await createPosition({
        electionId: selectedElection.id,
        name: inlinePosName.trim(),
        description: inlinePosDesc.trim() || undefined,
      });

      toast.success(`Position "${inlinePosName.trim()}" added!`);
      setInlinePosName("");
      setInlinePosDesc("");
      setIsAddingPositionInline(false);

      // Refresh positions
      const posRes = await getPositionsByElection(selectedElection.id);
      setPositions(posRes?.positions || posRes || []);
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to add position.");
      toast.error(errorMsg);
    } finally {
      setAddPosLoading(false);
    }
  };

  // Handle Nominate Candidate Submission
  const handleNominateCandidate = async (positionId) => {
    if (!candidateForm.studentId) {
      toast.error("Please select a student from your department.");
      return;
    }

    setNominateLoading(true);
    try {
      await createCandidate({
        electionId: selectedElection.id,
        positionId,
        studentId: candidateForm.studentId,
        manifesto: candidateForm.manifesto.trim() || undefined,
        photoUrl: candidateForm.photoUrl.trim() || undefined,
      });

      toast.success("Candidate nominated successfully!");
      setNominatingPositionId(null);
      setCandidateForm({ studentId: "", manifesto: "", photoUrl: "" });

      // Refresh candidates list
      const candRes = await getCandidatesByElection(selectedElection.id);
      setCandidates(candRes?.candidates || candRes || []);
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to nominate candidate.");
      toast.error(errorMsg);
    } finally {
      setNominateLoading(false);
    }
  };

  // Handle Add Single Eligible Voter
  const handleAddSingleVoter = async () => {
    if (!selectedStudentToAdd) {
      toast.error("Please select a student to enroll.");
      return;
    }

    setAddVoterLoading(true);
    try {
      await addEligibleVoter({
        electionId: selectedElection.id,
        studentId: selectedStudentToAdd,
      });

      toast.success("Student enrolled as eligible voter!");
      setSelectedStudentToAdd("");

      // Refresh voter list
      const votersRes = await getEligibleVotersByElection(selectedElection.id);
      setEligibleVoters(votersRes?.eligibleVoters || votersRes?.voters || votersRes || []);
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to enroll eligible voter.");
      toast.error(errorMsg);
    } finally {
      setAddVoterLoading(false);
    }
  };

  // Handle Bulk Enroll All Department Students
  const handleBulkEnrollVoters = async () => {
    setBulkVoterLoading(true);
    try {
      const res = await addBulkEligibleVoters({
        electionId: selectedElection.id,
        departmentId: adminProfile?.department_id,
        yearId: adminProfile?.year_id,
        sectionId: adminProfile?.section_id,
      });

      toast.success(res?.message || "Department students enrolled successfully!");

      // Refresh voter list
      const votersRes = await getEligibleVotersByElection(selectedElection.id);
      setEligibleVoters(votersRes?.eligibleVoters || votersRes?.voters || votersRes || []);
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to bulk enroll eligible voters.");
      toast.error(errorMsg);
    } finally {
      setBulkVoterLoading(false);
    }
  };

  // Handle Remove Single Eligible Voter
  const handleRemoveVoter = async (voterId) => {
    setDeletingVoterId(voterId);
    try {
      await removeEligibleVoter(voterId);
      toast.success("Eligible voter removed from roster.");
      setEligibleVoters((prev) => prev.filter((v) => v.id !== voterId));
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Failed to remove eligible voter.");
      toast.error(errorMsg);
    } finally {
      setDeletingVoterId(null);
    }
  };

  // Filtered Eligible Voters inside modal
  const filteredVoters = useMemo(() => {
    if (!voterSearch.trim()) return eligibleVoters;
    const q = voterSearch.toLowerCase().trim();
    return eligibleVoters.filter((v) => {
      const name = (v.full_name || v.student_name || "").toLowerCase();
      const code = (v.student_code || v.student_id || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [eligibleVoters, voterSearch]);

  // Determine allowed status transitions for an election
  const getNextStatusOptions = (currentStatus) => {
    const status = (currentStatus || "").toUpperCase();
    switch (status) {
      case "DRAFT":
        return [
          { status: "UPCOMING", label: "Schedule Poll (Upcoming)", icon: Clock, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
          { status: "ACTIVE", label: "Start Voting Now (Active)", icon: PlayCircle, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
        ];
      case "UPCOMING":
        return [
          { status: "DRAFT", label: "Revert to Draft", icon: FileText, color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
          { status: "ACTIVE", label: "Open Polls (Active)", icon: PlayCircle, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
        ];
      case "ACTIVE":
        return [
          { status: "CLOSED", label: "Close Polling (Closed)", icon: StopCircle, color: "text-red-600 bg-red-50 hover:bg-red-100" },
        ];
      case "CLOSED":
        return [
          { status: "RESULT_PUBLISHED", label: "Publish Official Results", icon: Share2, color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
        ];
      case "RESULT_PUBLISHED":
      default:
        return [];
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                <Building2 size={13} className="text-purple-600" />
                {adminProfile?.department_name || "Department"} Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1.5">
              Election Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage department elections, candidate nominations, voter rosters, polling statuses, and certified results.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Refresh elections list"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin text-purple-600" : "text-gray-500"}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm font-semibold text-white transition shadow-sm hover:shadow cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Election</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <Alert
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Elections"
            value={loading ? "..." : stats.total}
            icon={<Vote size={22} className="text-purple-600" />}
          />
          <StatCard
            title="Active Polls"
            value={loading ? "..." : stats.active}
            icon={<CheckCircle2 size={22} className="text-emerald-600" />}
          />
          <StatCard
            title="Upcoming Polls"
            value={loading ? "..." : stats.upcoming}
            icon={<Clock size={22} className="text-blue-600" />}
          />
          <StatCard
            title="Closed / Published"
            value={loading ? "..." : stats.closed}
            icon={<BarChart3 size={22} className="text-gray-600" />}
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by title, description or election ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="DRAFT">Draft</option>
                <option value="CLOSED">Closed</option>
                <option value="RESULT_PUBLISHED">Result Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Elections Grid */}
        <div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-12 text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-purple-50 text-purple-600 animate-spin">
                <RefreshCw size={24} />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Loading elections...
              </p>
            </div>
          ) : elections.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-12">
              <EmptyState
                icon={<Vote size={36} />}
                title="No elections available"
                message="There are currently no elections created in the system."
                action={
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Create First Election</span>
                  </button>
                }
              />
            </div>
          ) : filteredElections.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-12">
              <EmptyState
                icon={<Search size={36} />}
                title="No matching elections found"
                message="No elections match your search term or selected status filter."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                  >
                    <span>Reset Filters</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredElections.map((election) => {
                const nextOptions = getNextStatusOptions(election.status);

                return (
                  <div
                    key={election.id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-purple-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                          ELECTION #{election.id}
                        </span>
                        {renderStatusBadge(election.status)}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition line-clamp-2">
                          {election.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {election.description || "No description provided for this election."}
                        </p>
                      </div>

                      {/* Schedule Timing Box */}
                      <div className="bg-gray-50/90 rounded-xl p-3 border border-gray-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="text-gray-400 font-medium">Starts:</span>
                          <span className="font-semibold text-gray-800">
                            {formatDate(election.start_date || election.startDate)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="text-gray-400 font-medium">Ends:</span>
                          <span className="font-semibold text-gray-800">
                            {formatDate(election.end_date || election.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Status Lifecycle Transition Action Buttons */}
                      {nextOptions.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                            Status Actions:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {nextOptions.map((opt) => {
                              const OptIcon = opt.icon;
                              return (
                                <button
                                  key={opt.status}
                                  type="button"
                                  onClick={(e) => handleRequestStatusChange(election, opt.status, e)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border border-gray-200/80 cursor-pointer ${opt.color}`}
                                >
                                  <OptIcon size={13} />
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(election)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>View / Manage</span>
                        </button>

                        {(election.status === "RESULT_PUBLISHED" ||
                          election.status === "CLOSED") && (
                          <Link
                            to={`/admin/elections/${election.id}/results`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold shadow-2xs transition"
                          >
                            <BarChart3 size={14} />
                            <span>Results</span>
                          </Link>
                        )}
                      </div>

                      {/* Delete Action Button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenDeleteModal(election, e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete election"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CREATE ELECTION MODAL */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            if (!createLoading) setIsCreateModalOpen(false);
          }}
          title="Create Department Election"
          icon={<Vote size={24} className="text-purple-600" />}
          confirmText={createLoading ? "Creating..." : "Create Election"}
          cancelText="Cancel"
          onConfirm={handleCreateElectionSubmit}
          confirmDisabled={createLoading}
        >
          <form onSubmit={handleCreateElectionSubmit} className="space-y-4 text-left">
            {/* Scoped Department Banner */}
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs text-purple-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-purple-950">
                <Building2 size={14} className="text-purple-700" />
                Department Scoped Election ({adminProfile?.department_name || "Assigned Department"})
              </p>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Creates an election for your department. Active students in your department will be automatically enrolled as eligible voters if enabled.
              </p>
            </div>

            {/* Election Title */}
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
                placeholder="e.g. CSE Student Council Election 2026"
                value={electionForm.title}
                onChange={(e) =>
                  setElectionForm({ ...electionForm, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="electionDesc"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Description <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <textarea
                id="electionDesc"
                rows={2}
                placeholder="Brief summary of polling rules and contested posts..."
                value={electionForm.description}
                onChange={(e) =>
                  setElectionForm({ ...electionForm, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
              />
            </div>

            {/* Start and End Dates */}
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            {/* Positions Section */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Contested Positions ({positionsList.length})
                </label>
              </div>

              {/* Position Presets */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Quick Add Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STANDARD_POSITIONS.map((preset, pIdx) => {
                    const isAdded = positionsList.some(
                      (p) => p.name.toLowerCase() === preset.name.toLowerCase()
                    );
                    return (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleAddPresetPosition(preset)}
                        disabled={isAdded}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                          isAdded
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                        }`}
                      >
                        + {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Positions List */}
              <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                {positionsList.map((pos, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {pos.name}
                      </p>
                      {pos.description && (
                        <p className="text-[10px] text-gray-500 truncate">
                          {pos.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePosition(idx)}
                      className="p-1 text-red-500 hover:text-red-700 rounded transition cursor-pointer"
                      title="Remove position"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Position Row */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Custom Position Name..."
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPosition}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Auto Enroll Checkbox */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={electionForm.autoEnrollDepartment}
                  onChange={(e) =>
                    setElectionForm({
                      ...electionForm,
                      autoEnrollDepartment: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-xs font-semibold text-gray-800">
                    Auto-Enroll Department Students
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Automatically enrolls all active students in your department as eligible voters upon creation.
                  </p>
                </div>
              </label>
            </div>
          </form>
        </Modal>

        {/* STATUS CHANGE CONFIRMATION MODAL */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => {
            if (!statusChangeLoading) setStatusModalOpen(false);
          }}
          title="Confirm Election Status Change"
          icon={<AlertCircle size={24} className="text-purple-600" />}
          confirmText={statusChangeLoading ? "Updating..." : `Set to ${targetStatus}`}
          cancelText="Cancel"
          onConfirm={handleConfirmStatusChange}
          confirmDisabled={statusChangeLoading}
        >
          <div className="space-y-3 text-left">
            <p className="text-sm text-gray-700">
              Are you sure you want to transition status for{" "}
              <strong className="text-gray-900">&ldquo;{statusTargetElection?.title}&rdquo;</strong>?
            </p>

            <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs">
              <span className="font-semibold text-gray-700">
                {statusTargetElection?.status}
              </span>
              <ArrowRight size={14} className="text-purple-600" />
              <span className="font-bold text-purple-800">
                {targetStatus}
              </span>
            </div>

            {targetStatus === "ACTIVE" && (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                ✓ Once ACTIVE, students can immediately begin casting votes for contested positions.
              </p>
            )}

            {targetStatus === "CLOSED" && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                ⚠️ Once CLOSED, ballot submissions will be locked and no new votes will be accepted.
              </p>
            )}

            {targetStatus === "RESULT_PUBLISHED" && (
              <p className="text-xs text-purple-800 bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                🎉 Once PUBLISHED, verified election tallies and winner designations become visible to all students.
              </p>
            )}
          </div>
        </Modal>

        {/* DELETE CONFIRMATION MODAL */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deleteLoading) setIsDeleteModalOpen(false);
          }}
          title="Delete Election"
          icon={<AlertTriangle size={24} className="text-red-600" />}
          confirmText={deleteLoading ? "Deleting..." : "Delete Election"}
          confirmVariant="danger"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          confirmDisabled={deleteLoading}
        >
          <div className="space-y-3 text-left">
            <p className="text-sm text-gray-700">
              Are you sure you want to permanently delete{" "}
              <strong className="text-gray-900">
                &ldquo;{electionToDelete?.title}&rdquo;
              </strong>
              ?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
              <p className="font-semibold text-red-900">Warning: Irreversible Operation</p>
              <p className="mt-0.5 text-red-700">
                All associated positions, candidate nominations, and recorded votes for this election will be permanently deleted.
              </p>
            </div>
          </div>
        </Modal>

        {/* ELECTION DETAILS & MANAGEMENT MODAL */}
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={selectedElection?.title || "Election Details & Management"}
          icon={<Vote size={24} className="text-purple-600" />}
          cancelText="Close"
        >
          <div className="space-y-4 text-left">
            {/* Modal Header Badge & Quick Lifecycle Transitions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                  #{selectedElection?.id}
                </span>
                {renderStatusBadge(selectedElection?.status)}
                {selectedElection?.description && (
                  <span className="text-xs text-gray-500 truncate max-w-xs">
                    {selectedElection.description}
                  </span>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {getNextStatusOptions(selectedElection?.status).map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={opt.status}
                      type="button"
                      onClick={(e) => handleRequestStatusChange(selectedElection, opt.status, e)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border border-gray-200 ${opt.color} cursor-pointer`}
                    >
                      <OptIcon size={13} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleOpenDeleteModal(selectedElection)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Delete this election"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("positions")}
                className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "positions"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Positions ({positions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("candidates")}
                className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "candidates"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Candidates ({candidates.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("voters")}
                className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "voters"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Eligible Voters ({eligibleVoters.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "results"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Turnout & Results
              </button>
            </div>

            {/* Modal Tab Content */}
            {detailsLoading ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw size={24} className="animate-spin text-purple-600 mx-auto" />
                <p className="text-xs text-gray-500">Loading election components...</p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto pr-1 space-y-4">
                {/* TAB 1: POSITIONS */}
                {activeTab === "positions" && (
                  <div className="space-y-3">
                    {/* Add Position Toolbar (only for DRAFT/UPCOMING) */}
                    {(selectedElection?.status === "DRAFT" || selectedElection?.status === "UPCOMING") && (
                      <div>
                        {!isAddingPositionInline ? (
                          <button
                            type="button"
                            onClick={() => setIsAddingPositionInline(true)}
                            className="w-full py-2 px-3 border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>Add Position to this Election</span>
                          </button>
                        ) : (
                          <form
                            onSubmit={handleAddPositionInline}
                            className="bg-white rounded-xl p-3.5 border border-purple-200 shadow-xs space-y-2.5"
                          >
                            <span className="text-xs font-bold text-purple-900 block">
                              Add New Contested Position
                            </span>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Position Name (e.g. Department President) *"
                                required
                                value={inlinePosName}
                                onChange={(e) => setInlinePosName(e.target.value)}
                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <input
                                type="text"
                                placeholder="Description of role & responsibilities (Optional)"
                                value={inlinePosDesc}
                                onChange={(e) => setInlinePosDesc(e.target.value)}
                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setIsAddingPositionInline(false)}
                                className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={addPosLoading}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer"
                              >
                                {addPosLoading ? "Saving..." : "Save Position"}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {positions.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        <Award size={28} className="mx-auto text-gray-400 mb-1.5" />
                        <p className="font-semibold text-gray-700">No positions configured yet.</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Add contested positions for candidates to run for.
                        </p>
                      </div>
                    ) : (
                      positions.map((pos) => {
                        const posCandidates = candidates.filter((c) => c.position_id === pos.id);

                        return (
                          <div
                            key={pos.id}
                            className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Award size={15} className="text-purple-600 shrink-0" />
                                <h4 className="font-bold text-gray-900 text-sm">{pos.name}</h4>
                              </div>
                              {pos.description && (
                                <p className="text-gray-500 text-[11px] leading-relaxed">
                                  {pos.description}
                                </p>
                              )}
                              <p className="text-[10px] text-purple-700 font-semibold pt-0.5">
                                {posCandidates.length} candidate(s) running
                              </p>
                            </div>

                            {(selectedElection?.status === "DRAFT" || selectedElection?.status === "UPCOMING") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("candidates");
                                  setNominatingPositionId(pos.id);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition shrink-0 cursor-pointer"
                              >
                                <UserPlus size={12} />
                                <span>Nominate</span>
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* TAB 2: CANDIDATES */}
                {activeTab === "candidates" && (
                  <div className="space-y-4">
                    {positions.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">
                        Please add positions first before nominating candidates.
                      </p>
                    ) : (
                      positions.map((pos) => {
                        const posCandidates = candidates.filter((c) => c.position_id === pos.id);
                        const isNominatingThis = nominatingPositionId === pos.id;

                        return (
                          <div
                            key={pos.id}
                            className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                  <Award size={14} className="text-purple-600" />
                                  {pos.name}
                                </h4>
                                {pos.description && (
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {pos.description}
                                  </p>
                                )}
                              </div>

                              {(selectedElection?.status === "DRAFT" || selectedElection?.status === "UPCOMING") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNominatingPositionId(isNominatingThis ? null : pos.id);
                                    setCandidateForm({ studentId: "", manifesto: "", photoUrl: "" });
                                  }}
                                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition cursor-pointer"
                                >
                                  {isNominatingThis ? "Cancel" : "+ Nominate Candidate"}
                                </button>
                              )}
                            </div>

                            {/* Inline Nominate Form */}
                            {isNominatingThis && (
                              <div className="bg-white rounded-xl p-3.5 border border-purple-200 space-y-3 shadow-2xs">
                                <span className="text-xs font-bold text-purple-900 block">
                                  Nominate Student for {pos.name}
                                </span>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                    Select Department Student *
                                  </label>
                                  <select
                                    value={candidateForm.studentId}
                                    onChange={(e) =>
                                      setCandidateForm({
                                        ...candidateForm,
                                        studentId: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                  >
                                    <option value="">-- Choose Student from Roster --</option>
                                    {departmentStudents.map((st) => (
                                      <option key={st.id} value={st.id}>
                                        {st.full_name || st.name} ({st.student_id || st.studentId}) - {st.email}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                    Manifesto / Campaign Motto
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Dedicated to academic innovation and peer mentorship."
                                    value={candidateForm.manifesto}
                                    onChange={(e) =>
                                      setCandidateForm({
                                        ...candidateForm,
                                        manifesto: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                    Photo URL <span className="text-gray-400 font-normal">(Optional)</span>
                                  </label>
                                  <input
                                    type="url"
                                    placeholder="https://..."
                                    value={candidateForm.photoUrl}
                                    onChange={(e) =>
                                      setCandidateForm({
                                        ...candidateForm,
                                        photoUrl: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setNominatingPositionId(null)}
                                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleNominateCandidate(pos.id)}
                                    disabled={nominateLoading}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer"
                                  >
                                    {nominateLoading ? "Saving..." : "Save Candidate"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Candidate Cards */}
                            <div className="space-y-1.5">
                              {posCandidates.length === 0 ? (
                                <p className="text-[11px] text-gray-400 italic">
                                  No candidates nominated for this position.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 gap-2">
                                  {posCandidates.map((cand) => (
                                    <div
                                      key={cand.id}
                                      className="bg-white rounded-lg p-2.5 border border-gray-200 flex items-center justify-between gap-3 text-xs"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {cand.photo_url || cand.photoUrl ? (
                                          <img
                                            src={cand.photo_url || cand.photoUrl}
                                            alt={cand.student_name || cand.full_name}
                                            className="w-8 h-8 rounded-lg object-cover border border-purple-200 shrink-0"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                                            {(cand.student_name || cand.full_name || "C").charAt(0)}
                                          </div>
                                        )}

                                        <div className="min-w-0">
                                          <p className="font-semibold text-gray-900 truncate">
                                            {cand.student_name || cand.full_name || `Candidate #${cand.id}`}
                                          </p>
                                          {cand.student_code && (
                                            <p className="text-[10px] text-gray-400 font-mono">
                                              ID: {cand.student_code}
                                            </p>
                                          )}
                                          {cand.manifesto && (
                                            <p className="text-[10px] text-gray-600 italic truncate max-w-sm">
                                              &ldquo;{cand.manifesto}&rdquo;
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                        {cand.status || "ACTIVE"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* TAB 3: ELIGIBLE VOTERS */}
                {activeTab === "voters" && (
                  <div className="space-y-3.5">
                    {/* Bulk & Individual Voter Enrollment Controls */}
                    {(selectedElection?.status === "DRAFT" || selectedElection?.status === "UPCOMING") && (
                      <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-purple-950">Voter Enrollment</p>
                            <p className="text-[11px] text-purple-800">
                              Add students individually or bulk enroll your entire department roster.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleBulkEnrollVoters}
                            disabled={bulkVoterLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                          >
                            <Users size={14} />
                            <span>{bulkVoterLoading ? "Enrolling..." : "Bulk Enroll Department"}</span>
                          </button>
                        </div>

                        {/* Single Add Dropdown */}
                        <div className="flex gap-2">
                          <select
                            value={selectedStudentToAdd}
                            onChange={(e) => setSelectedStudentToAdd(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="">-- Select Specific Student to Add --</option>
                            {departmentStudents.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.full_name || st.name} ({st.student_id || st.studentId})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAddSingleVoter}
                            disabled={addVoterLoading || !selectedStudentToAdd}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                          >
                            {addVoterLoading ? "Adding..." : "+ Add"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Roster Search Box */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Search
                          size={14}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <input
                          type="text"
                          placeholder="Search enrolled voters..."
                          value={voterSearch}
                          onChange={(e) => setVoterSearch(e.target.value)}
                          className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {voterSearch && (
                          <button
                            type="button"
                            onClick={() => setVoterSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 shrink-0">
                        {filteredVoters.length} enrolled
                      </span>
                    </div>

                    {/* Voters List */}
                    {filteredVoters.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">
                        No eligible voters found matching your search.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                        {filteredVoters.map((voter) => (
                          <div
                            key={voter.id || voter.student_id}
                            className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {voter.student_name || voter.full_name || `Student ID: ${voter.student_id}`}
                              </p>
                              <p className="text-[11px] text-gray-500 font-mono">
                                ID: {voter.student_code || voter.student_id}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-400">
                                {formatDate(voter.created_at)}
                              </span>

                              {(selectedElection?.status === "DRAFT" || selectedElection?.status === "UPCOMING") && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVoter(voter.id)}
                                  disabled={deletingVoterId === voter.id}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                                  title="Remove voter from roster"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: TURNOUT & RESULTS */}
                {activeTab === "results" && (
                  <div className="space-y-4">
                    {/* Turnout Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Total Eligible
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">
                          {turnoutStats?.totalEligibleVoters ?? eligibleVoters.length}
                        </p>
                      </div>

                      <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-200 text-center">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                          Votes Cast
                        </span>
                        <p className="text-lg font-bold text-purple-900 mt-0.5">
                          {turnoutStats?.uniqueVotersParticipated ?? (resultsData ? "Recorded" : 0)}
                        </p>
                      </div>

                      <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-200 text-center col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Turnout Rate
                        </span>
                        <p className="text-lg font-bold text-emerald-700 mt-0.5">
                          {turnoutStats?.turnoutPercentage || "0.00%"}
                        </p>
                      </div>
                    </div>

                    {/* Results Breakdown if Available */}
                    {resultsData && Array.isArray(resultsData) && resultsData.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                          Position Tally:
                        </span>
                        {resultsData.map((posRes) => (
                          <div
                            key={posRes.positionId}
                            className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900">{posRes.positionName}</span>
                              <span className="text-gray-500 font-semibold">{posRes.totalVotes} total votes</span>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              {(posRes.candidates || []).map((c) => (
                                <div key={c.candidateId} className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-800">
                                      {c.candidateName} {posRes.winner?.candidateId === c.candidateId && "👑"}
                                    </span>
                                    <span className="font-mono text-purple-700 font-bold">
                                      {c.voteCount} ({c.percentage})
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-purple-600 rounded-full"
                                      style={{ width: c.percentage || "0%" }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                        {selectedElection?.status === "DRAFT" || selectedElection?.status === "UPCOMING"
                          ? "Voting has not started yet. Results will populate once ballots are cast."
                          : "Tabulating votes and turnout data..."}
                      </p>
                    )}

                    {/* Full Page Results Shortcut */}
                    {(selectedElection?.status === "RESULT_PUBLISHED" ||
                      selectedElection?.status === "CLOSED") && (
                      <div className="pt-2 text-center">
                        <Link
                          to={`/admin/elections/${selectedElection.id}/results`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                          <BarChart3 size={15} />
                          <span>View Official Result Breakdown →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
