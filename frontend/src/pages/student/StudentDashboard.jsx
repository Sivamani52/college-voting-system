import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Student Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Logged in as: <span className="font-medium text-gray-700">{user?.email}</span> (STUDENT)
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to the Student Voting Portal
          </h2>
          <p className="text-gray-600">
            View active elections, cast your ballots for student positions, and check published election results.
          </p>
        </div>
      </main>
    </div>
  );
}

