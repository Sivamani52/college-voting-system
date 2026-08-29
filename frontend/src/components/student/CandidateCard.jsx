import { User, CheckCircle2, Vote } from "lucide-react";

export default function CandidateCard({
  candidate,
  position,
  isSelectedByVote,
  hasVotedForPosition,
  isElectionActive,
  isEligible,
  isVoting,
  onVoteClick,
}) {
  const candidateName = candidate.full_name || candidate.name || "Candidate";

  return (
    <div
      className={`rounded-xl border p-5 transition flex flex-col justify-between ${
        isSelectedByVote
          ? "border-green-500 bg-green-50/30 ring-2 ring-green-500/20"
          : "border-gray-200 hover:border-blue-300 bg-white"
      }`}
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
            {candidateName.charAt(0) || <User size={18} />}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {candidateName}
            </h4>
            {candidate.student_id && (
              <p className="text-xs text-gray-500 font-mono">
                ID: {candidate.student_id}
              </p>
            )}
          </div>
        </div>

        {candidate.bio && (
          <p className="text-xs text-gray-600 line-clamp-3 mb-4">
            {candidate.bio}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        {isSelectedByVote ? (
          <div className="w-full py-2 px-3 rounded-lg bg-green-100 text-green-700 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 size={14} /> You Voted for this Candidate
          </div>
        ) : hasVotedForPosition ? (
          <button
            disabled
            className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed"
          >
            Position Already Voted
          </button>
        ) : isElectionActive && isEligible ? (
          <button
            onClick={() => onVoteClick(position, candidate)}
            disabled={isVoting}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Vote size={14} />
            Vote for {candidateName.split(" ")[0]}
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed"
          >
            Voting Not Available
          </button>
        )}
      </div>
    </div>
  );
}
