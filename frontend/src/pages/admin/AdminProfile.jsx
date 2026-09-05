import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  User,
  Mail,
  Building2,
  Calendar,
  Layers,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import InfoItem from "../../components/common/InfoItem";
import Alert from "../../components/common/Alert";
import { getMyAdminProfile, changePassword } from "../../services/studentService";

export default function AdminProfile() {
  const { user } = useAuth();

  // Profile Data State
  const [adminProfile, setAdminProfile] = useState(null);
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

  // Fetch Admin Profile
  const loadProfile = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setProfileError(null);

    try {
      const res = await getMyAdminProfile();
      setAdminProfile(res?.admin || res);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || "Failed to load admin profile information.";
      setProfileError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile(true);
  }, [loadProfile]);

  // Handle Change Password Form Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    // 1. Validate fields
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

    const targetUserId =
      adminProfile?.user_id ||
      adminProfile?.userId ||
      user?.id ||
      user?.userId;

    if (!targetUserId) {
      const msg = "User ID not found. Please re-authenticate.";
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePassword({
        userId: Number(targetUserId),
        currentPassword,
        newPassword,
      });

      toast.success(res?.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        "Failed to change password. Please check your current password.";
      setPasswordError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper values
  const fullName = adminProfile?.full_name || user?.name || "Administrator";
  const email = adminProfile?.email || user?.email || "Not available";
  const role = adminProfile?.role || user?.role || "ADMIN";
  const userStatus = adminProfile?.user_status || adminProfile?.status || "ACTIVE";

  const departmentDisplay =
    adminProfile?.department_id !== undefined && adminProfile?.department_id !== null
      ? `Department ID #${adminProfile.department_id}`
      : "Not available";

  const yearDisplay =
    adminProfile?.year_id !== undefined && adminProfile?.year_id !== null
      ? `Year ID #${adminProfile.year_id}`
      : "Not available";

  const sectionDisplay =
    adminProfile?.section_id !== undefined && adminProfile?.section_id !== null
      ? `Section ID #${adminProfile.section_id}`
      : "Not available";

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                <ShieldCheck size={12} /> Account Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1.5">
              Admin Profile
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View your administrator account details and department assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadProfile(false)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs disabled:opacity-50 self-start sm:self-auto cursor-pointer"
            title="Refresh profile information"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin text-blue-600" : "text-gray-500"}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {profileError && (
          <Alert
            type="error"
            message={profileError}
            onDismiss={() => setProfileError(null)}
          />
        )}

        {/* Main Profile Header Card */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white via-white to-blue-50/40 rounded-2xl border border-blue-100 shadow-xs p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-md shadow-blue-500/20 uppercase">
                  {fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {fullName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wide border border-blue-200">
                      {role}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {userStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                    <Mail size={15} className="text-gray-400" />
                    <span>{email}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout: Profile Information & Change Password */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Information Section (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Account Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Administrator personal and credential information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                  <InfoItem label="Full Name" value={fullName} />
                </div>

                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                  <InfoItem label="Email Address" value={email} />
                </div>

                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                  <InfoItem label="Role" value={role} />
                </div>

                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                  <InfoItem label="Account Status" value={userStatus} />
                </div>
              </div>
            </div>

            {/* Department Scope Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Assigned Class Scope
                  </h3>
                  <p className="text-xs text-gray-500">
                    Jurisdiction and department boundaries assigned to your account
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-gray-200 text-blue-600 shrink-0 mt-0.5">
                    <Building2 size={16} />
                  </div>
                  <InfoItem label="Department" value={departmentDisplay} />
                </div>

                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-gray-200 text-emerald-600 shrink-0 mt-0.5">
                    <Calendar size={16} />
                  </div>
                  <InfoItem label="Year" value={yearDisplay} />
                </div>

                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-gray-200 text-purple-600 shrink-0 mt-0.5">
                    <Layers size={16} />
                  </div>
                  <InfoItem label="Section" value={sectionDisplay} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Change Password Section (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Change Password
                  </h3>
                  <p className="text-xs text-gray-500">
                    Update your account login credentials
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="mb-4">
                  <Alert
                    type="error"
                    message={passwordError}
                    onDismiss={() => setPasswordError(null)}
                  />
                </div>
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
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Password must be at least 8 characters long.
                  </p>
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
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <KeyRound size={16} />
                  <span>{passwordLoading ? "Updating Password..." : "Change Password"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
