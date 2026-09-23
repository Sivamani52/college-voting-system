import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Vote,
  Trophy,
  CheckCircle2,
  Lock,
  UserCheck,
  GraduationCap,
  Building2,
  ShieldCheck,
  Award,
  Clock,
  RefreshCw,
  PlusCircle,
  Layers,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import StatCard from "../../components/common/StatCard";
import {
  getAllElections,
  getAllAdmins,
  getAllStudents,
} from "../../services/electionService";
import {
  getAllDepartments,
  getYears,
  getSections,
} from "../../services/departmentService";

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const [elections, setElections] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [eRes, aRes, sRes, dRes, yRes, secRes] = await Promise.all([
        getAllElections().catch(() => ({ elections: [] })),
        getAllAdmins().catch(() => ({ admins: [] })),
        getAllStudents().catch(() => ({ students: [] })),
        getAllDepartments().catch(() => ({ departments: [] })),
        getYears().catch(() => ({ years: [] })),
        getSections().catch(() => ({ sections: [] })),
      ]);

      setElections(eRes.elections || eRes.data || (Array.isArray(eRes) ? eRes : []));
      setAdmins(aRes.admins || aRes.data || (Array.isArray(aRes) ? aRes : []));
      setStudents(sRes.students || sRes.data || (Array.isArray(sRes) ? sRes : []));
      setDepartments(dRes.departments || dRes.data || (Array.isArray(dRes) ? dRes : []));
      setYears(yRes.years || yRes.data || (Array.isArray(yRes) ? yRes : []));
      setSections(secRes.sections || secRes.data || (Array.isArray(secRes) ? secRes : []));
    } catch (err) {
      console.error("Super Admin Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = elections.filter((e) => e.status === "ACTIVE").length;
  const completedCount = elections.filter(
    (e) => e.status === "RESULT_PUBLISHED" || e.status === "CLOSED"
  ).length;

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
                <ShieldCheck size={14} className="text-purple-300" />
                <span>Super Admin Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Super Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Welcome, <strong className="text-white">{user?.name || user?.email}</strong>. Institution-wide election overview, academic departments, administrators, and student voter base.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Quick Administrative Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/super-admin/departments?action=add"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 border border-purple-100 transition group cursor-pointer"
            >
              <div className="p-2 bg-purple-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Building2 size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">Add Department</p>
                <p className="text-[10px] text-purple-700/70 truncate">New faculty</p>
              </div>
            </Link>

            <Link
              to="/super-admin/years-sections?action=add"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 border border-indigo-100 transition group cursor-pointer"
            >
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Layers size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">Add Year/Section</p>
                <p className="text-[10px] text-indigo-700/70 truncate">Academic class</p>
              </div>
            </Link>

            <Link
              to="/super-admin/admins?action=add"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 border border-blue-100 transition group cursor-pointer"
            >
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <UserCheck size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">Add Admin</p>
                <p className="text-[10px] text-blue-700/70 truncate">Dept coordinator</p>
              </div>
            </Link>

            <Link
              to="/super-admin/elections?action=add"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 border border-emerald-100 transition group cursor-pointer"
            >
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Vote size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">Create Election</p>
                <p className="text-[10px] text-emerald-700/70 truncate">New ballot event</p>
              </div>
            </Link>
          </div>
        </div>

        {/* System Governance Checklist */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100 p-4 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <Sparkles size={16} />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                Institutional Administration Hierarchy
              </h2>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Root Governance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Academic Hierarchy</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Define faculties, academic departments, study years, and class sections.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Department Coordinators</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Provision Admin user credentials with department and class-scoped permissions.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Institution Auditing</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Oversee all collegiate elections, voter turnouts, and certified vote results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - 8 Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Departments"
            value={loading ? "..." : departments.length}
            icon={<Building2 size={22} className="text-indigo-600" />}
            description="Academic faculties"
          />
          <StatCard
            title="Academic Years"
            value={loading ? "..." : years.length}
            icon={<Calendar size={22} className="text-blue-600" />}
            description="Enrolled study years"
          />
          <StatCard
            title="Sections"
            value={loading ? "..." : sections.length}
            icon={<Layers size={22} className="text-cyan-600" />}
            description="Class cohorts"
          />
          <StatCard
            title="Dept Admins"
            value={loading ? "..." : admins.length}
            icon={<UserCheck size={22} className="text-purple-600" />}
            description="Assigned administrators"
          />
          <StatCard
            title="Total Students"
            value={loading ? "..." : students.length}
            icon={<GraduationCap size={22} className="text-emerald-600" />}
            description="Enrolled student voters"
          />
          <StatCard
            title="Total Elections"
            value={loading ? "..." : elections.length}
            icon={<Vote size={22} className="text-purple-600" />}
            description="All ballot sessions"
          />
          <StatCard
            title="Live Elections"
            value={loading ? "..." : activeCount}
            icon={<CheckCircle2 size={22} className="text-green-600" />}
            description="Voting open now"
          />
          <StatCard
            title="Completed Elections"
            value={loading ? "..." : completedCount}
            icon={<Trophy size={22} className="text-amber-500" />}
            description="Closed & published"
          />
        </div>

        {/* Grid: Recent Elections & Recent Admins */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Elections */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                    <Vote size={18} />
                  </div>
                  <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Recent Elections ({elections.length})
                  </h2>
                </div>
                <Link
                  to="/super-admin/elections"
                  className="text-xs font-bold text-purple-600 hover:text-purple-800"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center text-xs text-gray-400">Loading elections...</div>
                ) : elections.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">No elections found.</div>
                ) : (
                  elections.slice(0, 5).map((election) => (
                    <div
                      key={election.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition"
                    >
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-gray-900 truncate">
                          {election.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {election.description || "College voting event."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {election.status === "RESULT_PUBLISHED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                            <Award size={11} /> Published
                          </span>
                        )}
                        {election.status === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                          </span>
                        )}
                        {election.status === "CLOSED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Lock size={11} /> Closed
                          </span>
                        )}
                        {(election.status === "UPCOMING" || election.status === "DRAFT") && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                            <Clock size={11} /> Upcoming
                          </span>
                        )}

                        <Link
                          to={`/super-admin/elections/${election.id}/results`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition border border-purple-200"
                        >
                          <Trophy size={13} />
                          <span>Results</span>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Admins */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                    <UserCheck size={18} />
                  </div>
                  <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Dept Admins ({admins.length})
                  </h2>
                </div>
                <Link
                  to="/super-admin/admins"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center text-xs text-gray-400">Loading admins...</div>
                ) : admins.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">No admins assigned.</div>
                ) : (
                  admins.slice(0, 5).map((admin) => (
                    <div
                      key={admin.id || admin.user_id}
                      className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                          {(admin.full_name || "A").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 truncate">
                            {admin.full_name}
                          </h3>
                          <p className="text-[11px] text-gray-500 truncate">
                            {admin.email}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 shrink-0">
                        <Building2 size={10} />
                        {admin.department_code || admin.department_name || `Dept #${admin.department_id}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Students Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <GraduationCap size={18} />
              </div>
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
                Registered Students ({students.length})
              </h2>
            </div>

            <Link
              to="/super-admin/students"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-purple-700 text-xs font-bold transition shadow-2xs"
            >
              <span>Manage All Students</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Full Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400">Loading students...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400">No students registered.</td>
                  </tr>
                ) : (
                  students.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-3 font-mono font-bold text-purple-600">
                        {s.student_id}
                      </td>
                      <td className="px-5 py-3 font-bold text-gray-900">
                        {s.full_name}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {s.email}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {s.department_name || `Dept #${s.department_id}`}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}