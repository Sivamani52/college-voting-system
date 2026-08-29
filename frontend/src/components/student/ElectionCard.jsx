import { Link } from "react-router-dom";
import { Vote, CalendarDays, ChevronRight, Clock, Award, Lock } from "lucide-react";

export function getElectionStatusStyle(status) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "UPCOMING":
      return "bg-blue-100 text-blue-700";
    case "CLOSED":
      return "bg-gray-100 text-gray-700";
    case "RESULT_PUBLISHED":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function ElectionStatusBadge({ status }) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live & Active
        </span>
      );
    case "UPCOMING":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          <Clock size={13} />
          Upcoming
        </span>
      );
    case "CLOSED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
          <Lock size={13} />
          Closed
        </span>
      );
    case "RESULT_PUBLISHED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
          <Award size={13} />
          Results Published
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}

export default function ElectionCard({ election }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Vote size={24} />
          </div>
          <ElectionStatusBadge status={election.status} />
        </div>

        <h4 className="mt-5 text-lg font-bold text-gray-900">
          {election.title}
        </h4>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {election.description || "College election"}
        </p>

        <div className="mt-5 space-y-2 text-xs text-gray-500">
          {election.start_date && (
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-blue-500" />
              <span>
                Starts: {new Date(election.start_date).toLocaleString()}
              </span>
            </div>
          )}

          {election.end_date && (
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-orange-500" />
              <span>
                Ends: {new Date(election.end_date).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <Link
        to={`/student/elections/${election.id}`}
        className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-sm text-white hover:bg-blue-700 transition shadow-xs"
      >
        {election.status === "ACTIVE"
          ? "View & Vote"
          : election.status === "RESULT_PUBLISHED"
          ? "View Results"
          : "View Election"}
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
