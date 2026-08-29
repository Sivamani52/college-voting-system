import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data.message || "OTP sent to your registered email.");
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to send OTP. Please verify your email."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-forgot-password-otp", {
        email,
        otp: otp.trim(),
      });
      setMessage(response.data.message || "OTP verified successfully.");
      setUserId(response.data.userId);
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        userId,
        newPassword,
      });
      setMessage(response.data.message || "Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 1:
        return "Enter your registered email to receive an OTP";
      case 2:
        return "Enter the 6-digit OTP sent to your email";
      case 3:
        return "Create your new secure password";
      default:
        return "";
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle={getSubtitle()}
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

      {/* Step 1: Request OTP */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-700">
              Registered Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.com"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* Step 2: Verify OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-700">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              required
              maxLength={10}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 tracking-widest text-center text-lg font-mono"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 rounded-xl bg-blue-600 py-2.5 font-semibold text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
