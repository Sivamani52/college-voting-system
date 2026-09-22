import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Mail,
  Phone,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/common/Navbar";
import Alert from "../../components/common/Alert";
import InfoItem from "../../components/common/InfoItem";
import { getMyProfile, changePassword } from "../../services/studentService";

export default function StudentProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const loadProfile = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setProfileError(null);

    try {
      const res = await getMyProfile();
      setProfile(res?.student || res?.data || res);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to load student profile information.";
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile(true);
  }, [loadProfile]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      const msg = "All password fields are required.";
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword.length < 8) {
      const msg = "New password must be at least 8 characters long.";
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = "New password and confirmation do not match.";
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    if (currentPassword === newPassword) {
      const msg = "New password must be different from current password.";
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword({
        userId: user?.id,
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to update password. Please check your current credentials.";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const isProfileActive =
    (profile?.status || profile?.user_status || "ACTIVE").toUpperCase() === "ACTIVE";

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-12">
      <Navbar subtitle="Student Portal" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              <GraduationCap size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Student Profile & Account
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isProfileActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {isProfileActive ? "Active Student" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Official student registry record, academic placement, and security settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadProfile(false)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh Profile"}</span>
          </button>
        </div>

        {profileError && (
          <Alert
            type="error"
            message={profileError}
            onDismiss={() => setProfileError(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Academic & Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity & Personal Info Card */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                    Student Information
                  </h2>
                  <p className="text-[11px] text-gray-400">Personal & institutional credentials</p>
                </div>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Loading student details...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<User size={16} />}
                    label="Full Name"
                    value={profile?.full_name || user?.name || "Student"}
                  />
                  <InfoItem
                    icon={<Hash size={16} />}
                    label="Student Roll / ID"
                    value={profile?.student_id || "Not assigned"}
                  />
                  <InfoItem
                    icon={<Mail size={16} />}
                    label="College Email"
                    value={profile?.email || user?.email || "Not specified"}
                  />
                  <InfoItem
                    icon={<Phone size={16} />}
                    label="Phone Number"
                    value={profile?.phone || "None registered"}
                  />
                </div>
              )}
            </div>

            {/* Academic Placement Card */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                    Academic Placement
                  </h2>
                  <p className="text-[11px] text-gray-400">Assigned college department, year, and section</p>
                </div>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Loading academic placement...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InfoItem
                    icon={<Building2 size={16} />}
                    label="Department"
                    value={
                      profile?.department_name
                        ? `${profile.department_name} (${profile.department_code || ""})`
                        : profile?.department_id
                        ? `Department #${profile.department_id}`
                        : "Institutional"
                    }
                  />
                  <InfoItem
                    icon={<Calendar size={16} />}
                    label="Academic Year"
                    value={
                      profile?.year_name ||
                      (profile?.year_id ? `Year #${profile.year_id}` : "All Years")
                    }
                  />
                  <InfoItem
                    icon={<Layers size={16} />}
                    label="Section"
                    value={
                      profile?.section_name ||
                      (profile?.section_id ? `Section #${profile.section_id}` : "All Sections")
                    }
                  />
                </div>
              )}
            </div>

            {/* Electoral Eligibility Notice */}
            <div className="bg-blue-50/70 rounded-3xl border border-blue-200/80 p-6 shadow-2xs flex items-start gap-4">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shrink-0 shadow-xs">
                <ShieldCheck size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-blue-950">
                  Voter Verification & Eligibility Status
                </h3>
                <p className="text-xs text-blue-800/80 leading-relaxed">
                  Your voter franchise is bound to your Department and Academic Placement. During active
                  elections, your eligibility is automatically determined by the election administrator.
                  Duplicate votes are cryptographically prevented.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Security & Change Password */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                    Security Credentials
                  </h2>
                  <p className="text-[11px] text-gray-400">Update your portal password</p>
                </div>
              </div>

              {passwordError && (
                <Alert
                  type="error"
                  message={passwordError}
                  onDismiss={() => setPasswordError(null)}
                />
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      tabIndex="-1"
                    >
                      {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      tabIndex="-1"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/70 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
