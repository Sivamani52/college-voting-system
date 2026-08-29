import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
          state: { userId: data.userId || data.user?.id }
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
          setError("Invalid user role.");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="College Voting"
      subtitle="Sign in with your College Email or Student ID"
      footer={
        <p className="text-xs text-gray-500">
          Official Secure Election & Voting System
        </p>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onDismiss={() => setError("")} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-700">
            College Email or Student ID
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. superadmin@college.com or 21CS001"
            required
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-11 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthLayout>
  );
}