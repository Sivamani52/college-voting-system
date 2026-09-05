import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
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
      const response = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setMessage(response.data.message || "OTP sent to your registered college email.");
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please verify your registered email address."
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
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      setMessage(response.data.message || "OTP verified successfully. Now create your new password.");
      setUserId(response.data.userId);
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP code. Please check and try again."
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
      setError("New password and confirmation do not match.");
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
        return "Enter your college email to receive a secure recovery code";
      case 2:
        return "Enter the 6-digit verification code sent to your inbox";
      case 3:
        return "Choose a strong new password for your account";
      default:
        return "";
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={getSubtitle()}
      footer={
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to Sign In</span>
        </button>
      }
    >
      {/* Step Progress Stepper */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === s
                ? "w-8 bg-blue-600"
                : step > s
                ? "w-4 bg-emerald-500"
                : "w-4 bg-gray-200"
            }`}
          />
        ))}
      </div>

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

      {/* Step 1: Request OTP */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700"
            >
              Registered College Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@college.edu"
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-xs sm:text-sm text-white hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: Verify OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="otp"
              className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700 text-center"
            >
              6-Digit OTP Code
            </label>
            <div className="relative">
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="• • • • • •"
                required
                maxLength={10}
                autoFocus
                className="w-full py-3 bg-slate-50/60 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 tracking-widest text-center text-xl font-bold font-mono text-gray-900 transition shadow-2xs"
              />
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 rounded-xl border border-gray-300 bg-white py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-98 transition shadow-2xs cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 font-bold text-xs sm:text-sm text-white hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-bold text-xs sm:text-sm text-white hover:from-emerald-700 hover:to-teal-700 active:scale-98 disabled:opacity-50 transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <CheckCircle2 size={16} />
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
