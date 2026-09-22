import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Retrieve userId from location state, logged in user, or input
  const stateUserId = location.state?.userId || user?.id;

  const [userIdInput, setUserIdInput] = useState(stateUserId ? String(stateUserId) : "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const targetUserId = stateUserId || Number(userIdInput);
    if (!targetUserId) {
      setError("User account ID is required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/change-password", {
        userId: Number(targetUserId),
        currentPassword,
        newPassword,
      });

      setMessage(response.data.message || "Password changed successfully! Redirecting to login...");

      if (user) {
        logout();
      }

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Change Password"
      subtitle="Update your temporary or current password to maintain account security"
      footer={
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </button>
      }
    >
      {error && (
        <div className="mb-3">
          <Alert type="error" message={error} onDismiss={() => setError("")} />
        </div>
      )}

      {message && (
        <div className="mb-3">
          <Alert type="success" message={message} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {!stateUserId && (
          <div>
            <label
              htmlFor="userIdInput"
              className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700"
            >
              User ID #
            </label>
            <div className="relative">
              <input
                id="userIdInput"
                type="number"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="Enter your system user ID"
                required
                className="w-full px-4 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
              />
            </div>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700"
          >
            Current / Temporary Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock size={16} />
            </div>
            <input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current or temporary password"
              required
              className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
              tabIndex="-1"
            >
              {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700"
          >
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <KeyRound size={16} />
            </div>
            <input
              id="newPassword"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
              tabIndex="-1"
            >
              {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <KeyRound size={16} />
            </div>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              minLength={8}
              className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
              tabIndex="-1"
            >
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-xs sm:text-sm text-white hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Confirm & Save Password</span>
              <CheckCircle2 size={16} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
