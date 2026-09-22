import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const cleanIdentifier = identifier.trim();
      const data = await login(cleanIdentifier, password);

      /*
       * First-login password change
       */
      if (data.requiresPasswordChange || data.user?.must_change_password) {
        navigate("/change-password", {
          state: { userId: data.userId || data.user?.id },
        });
        return;
      }

      const loggedInUser = data.user;

      /*
       * Role-based dashboard
       */
      switch (loggedInUser?.role) {
        case "SUPER_ADMIN":
          navigate("/superadmin");
          break;

        case "ADMIN":
          navigate("/admin");
          break;

        case "STUDENT":
          navigate("/student");
          break;

        default:
          setError("Invalid user role detected.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please verify your college email/ID and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in with your College Email or Student ID to access elections"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>Need system assistance?</span>
          <span className="text-gray-400 font-medium">Contact Super Admin</span>
        </div>
      }
    >
      {error && (
        <div className="mb-2">
          <Alert type="error" message={error} onDismiss={() => setError("")} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Identifier Field */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700"
          >
            College Email or Student ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail size={16} />
            </div>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. superadmin@college.com or 21CS001"
              required
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock size={16} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              required
              className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50/60 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
              tabIndex="-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-xs sm:text-sm text-white hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Portal</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}