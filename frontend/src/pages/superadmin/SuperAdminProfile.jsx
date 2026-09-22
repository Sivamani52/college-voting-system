import { useState } from "react";
import { User, ShieldCheck, Mail, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import SuperAdminLayout from "../../components/superadmin/SuperAdminLayout";
import api from "../../services/api";

export default function SuperAdminProfile() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setChanging(true);
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Super Admin Profile
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            System root administrator profile and security credentials.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
              {(user?.name || user?.email || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {user?.name || "Super Administrator"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-700">
                  <ShieldCheck size={12} /> Root Access
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                <Mail size={13} className="text-gray-400" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <KeyRound size={18} className="text-purple-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Change Super Admin Password
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <button
              type="submit"
              disabled={changing}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {changing ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
