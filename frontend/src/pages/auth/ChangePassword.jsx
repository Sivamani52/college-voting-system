import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const targetUserId = stateUserId || Number(userIdInput);
    if (!targetUserId) {
      setError("User ID is required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
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
      subtitle="Update your temporary or current password"
      footer={
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          &larr; Back to Sign In
        </button>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onDismiss={() => setError("")} />
        </div>
      )}

      {message && (
        <div className="mb-4">
          <Alert type="success" message={message} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!stateUserId && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-700">
              User ID #
            </label>
            <input
              type="number"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="Enter your user ID"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-700">
            Current / Temporary Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-700">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            minLength={8}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
        >
          {loading ? "Updating Password..." : "Change Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
