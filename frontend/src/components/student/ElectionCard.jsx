import { Link } from "react-router-dom";
import {
  Vote,
  CalendarDays,
  ChevronRight,
  Clock,
  Award,
  Lock,
  CheckCircle2,
  Trophy,
} from "lucide-react";

export function ElectionStatusBadge({ status, hasVoted }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {hasVoted && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Voted
        </span>
      )}

      {status === "ACTIVE" && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live & Active
        </span>
      )}

      {status === "UPCOMING" && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          <Clock size={13} />
          Upcoming
        </span>
      )}

      {status === "CLOSED" && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
          <Lock size={13} />
          Closed
        </span>
      )}

      {status === "RESULT_PUBLISHED" && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
          <Award size={13} />
          Results Published
        </span>
      )}

      {!["ACTIVE", "UPCOMING", "CLOSED", "RESULT_PUBLISHED"].includes(status) && (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          {status}
        </span>
      )}
    </div>
  );
}

export default function ElectionCard({ election }) {
  const isPublished = election.status === "RESULT_PUBLISHED";
  const isActive = election.status === "ACTIVE";
  const hasVoted = Boolean(
    election.has_voted ||
    election.hasVoted ||
    (election.myVotes && election.myVotes.length > 0)
  );

  return (
    <div
      className={`bg-white rounded-3xl border p-6 transition duration-200 flex flex-col justify-between hover:shadow-md ${
        isPublished
          ? "border-purple-200 hover:border-purple-300"
          : hasVoted
          ? "border-emerald-200 hover:border-emerald-300"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <div>
        {/* Header Icon + Badges */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${
              isPublished
                ? "bg-purple-100 text-purple-700"
                : hasVoted
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {isPublished ? (
              <Trophy size={24} />
            ) : hasVoted ? (
              <CheckCircle2 size={24} />
            ) : (
              <Vote size={24} />
            )}
          </div>

          <ElectionStatusBadge
            status={election.status}
            hasVoted={hasVoted}
          />
        </div>

        {/* Title */}
        <h4 className="mt-5 text-lg font-bold text-gray-900 line-clamp-1">
          {election.title}
        </h4>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {election.description || "Official college election."}
        </p>

        {/* Dates */}
        <div className="mt-5 space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
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

      {/* Action Buttons */}
      <div className="mt-6 pt-2">
        {isPublished ? (
          <div className="space-y-2">
            <Link
              to={`/student/results/${election.id}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 font-bold text-sm text-white transition shadow-xs"
            >
              <Trophy size={16} />
              <span>View Results</span>
              <ChevronRight size={16} />
            </Link>

            <Link
              to={`/student/elections/${election.id}`}
              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gray-50 hover:bg-gray-100 py-2 text-xs font-semibold text-gray-600 transition"
            >
              <span>View Candidates & Positions</span>
            </Link>
          </div>
        ) : isActive ? (
          <Link
            to={`/student/elections/${election.id}`}
            className={`flex items-center justify-center gap-2 w-full rounded-xl py-2.5 font-semibold text-sm transition shadow-xs ${
              hasVoted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {hasVoted ? (
              <>
                <CheckCircle2 size={16} />
                <span>Vote Cast - View Status</span>
              </>
            ) : (
              <>
                <span>View & Vote</span>
                <ChevronRight size={16} />
              </>
            )}
          </Link>
        ) : (
          <Link
            to={`/student/elections/${election.id}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gray-100 hover:bg-gray-200 py-2.5 font-semibold text-sm text-gray-700 transition"
          >
            <span>View Election</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
