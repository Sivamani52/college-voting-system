import { User, CheckCircle2, Vote, Check } from "lucide-react";

export default function CandidateCard({
  candidate,
  position,
  isSelectedByVote, // Already in DB
  isSelectedForBatch, // Selected by user on UI before submission
  hasVotedForPosition,
  isElectionActive,
  isEligible,
  isVoting,
  onSelectCandidate,
}) {
  const candidateName = candidate.full_name || candidate.name || "Candidate";

  return (
    <div
      onClick={() => {
        if (!hasVotedForPosition && !isSelectedByVote && isElectionActive && isEligible && !isVoting && onSelectCandidate) {
          onSelectCandidate(position, candidate);
        }
      }}
      className={`rounded-2xl border p-5 transition flex flex-col justify-between cursor-pointer ${
        isSelectedByVote
          ? "border-green-500 bg-green-50/40 ring-2 ring-green-500/20 cursor-default"
          : isSelectedForBatch
          ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/30 shadow-sm"
          : hasVotedForPosition
          ? "border-gray-200 bg-gray-50/50 opacity-70 cursor-not-allowed"
          : "border-gray-200 hover:border-blue-300 hover:shadow-xs bg-white"
      }`}
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
              alt={candidateName}
              className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
            />
          ) : (
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                isSelectedForBatch
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {candidateName.charAt(0) || <User size={18} />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 text-sm truncate">
              {candidateName}
            </h4>
            {candidate.student_id && (
              <p className="text-xs text-gray-500 font-mono">
                ID: {candidate.student_id}
              </p>
            )}
          </div>
        </div>

        {candidate.manifesto ? (
          <p className="text-xs text-gray-600 line-clamp-3 mb-4">
            &ldquo;{candidate.manifesto}&rdquo;
          </p>
        ) : candidate.bio ? (
          <p className="text-xs text-gray-600 line-clamp-3 mb-4">
            {candidate.bio}
          </p>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        {isSelectedByVote ? (
          <div className="w-full py-2 px-3 rounded-xl bg-green-100 text-green-700 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 size={14} /> Vote Cast
          </div>
        ) : hasVotedForPosition ? (
          <button
            type="button"
            disabled
            className="w-full py-2 px-3 rounded-xl bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed"
          >
            Position Already Voted
          </button>
        ) : isSelectedForBatch ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCandidate(position, candidate);
            }}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Check size={14} /> Selected Choice
          </button>
        ) : isElectionActive && isEligible ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCandidate(position, candidate);
            }}
            disabled={isVoting}
            className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Vote size={14} />
            Select Candidate
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-2 px-3 rounded-xl bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed"
          >
            Voting Not Available
          </button>
        )}
      </div>
    </div>
  );
}
