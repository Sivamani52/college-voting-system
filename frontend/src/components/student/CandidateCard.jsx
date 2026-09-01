import { User, CheckCircle2, Vote, Check } from "lucide-react";

export default function CandidateCard({
  candidate,
  position,
  isSelectedByVote, // Already in DB (student cast vote for this candidate)
  isSelectedForBatch, // Selected by user on UI before submission
  hasVotedForPosition,
  isElectionActive,
  isEligible,
  isVoting,
  onSelectCandidate,
}) {
  const candidateName =
    candidate.full_name ||
    candidate.name ||
    candidate.candidateName ||
    "Candidate";

  const studentId =
    candidate.student_id ||
    candidate.studentCode ||
    candidate.studentId;

  return (
    <div
      onClick={() => {
        if (
          !hasVotedForPosition &&
          !isSelectedByVote &&
          isElectionActive &&
          isEligible &&
          !isVoting &&
          onSelectCandidate
        ) {
          onSelectCandidate(position, candidate);
        }
      }}
      className={`relative rounded-3xl border p-5 transition flex flex-col justify-between cursor-pointer ${
        isSelectedByVote
          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/30 shadow-xs cursor-default"
          : isSelectedForBatch
          ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/30 shadow-sm"
          : hasVotedForPosition
          ? "border-gray-200 bg-gray-50/50 opacity-70 cursor-not-allowed"
          : "border-gray-200 hover:border-blue-300 hover:shadow-xs bg-white"
      }`}
    >
      {/* Top right Voted Badge Tick Mark */}
      {isSelectedByVote && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
          <CheckCircle2 size={13} />
          <span>Voted</span>
        </div>
      )}

      {isSelectedForBatch && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
          <Check size={13} />
          <span>Selected</span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-3 pr-16">
          {candidate.photo_url || candidate.photoUrl ? (
            <img
              src={candidate.photo_url || candidate.photoUrl}
              alt={candidateName}
              className={`w-12 h-12 rounded-2xl object-cover border shadow-xs shrink-0 ${
                isSelectedByVote
                  ? "border-emerald-400 ring-2 ring-emerald-300"
                  : isSelectedForBatch
                  ? "border-blue-400"
                  : "border-gray-200"
              }`}
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                isSelectedByVote
                  ? "bg-emerald-600 text-white"
                  : isSelectedForBatch
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
            {studentId && (
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                ID: {studentId}
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
          <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>Your Vote (Recorded)</span>
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
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Check size={15} /> Choice Selected
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
