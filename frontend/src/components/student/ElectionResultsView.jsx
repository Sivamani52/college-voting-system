import { Link } from "react-router-dom";
import { Trophy, ChevronRight, CheckCircle2, BarChart2 } from "lucide-react";

export default function ElectionResultsView({ results, electionId }) {
  if (!results) return null;

  const resultsList = Array.isArray(results)
    ? results
    : results.results || [];

  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shrink-0 shadow-xs">
            <Trophy size={26} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-800 text-purple-200 mb-1">
              <CheckCircle2 size={12} className="text-amber-400" />
              Certified
            </div>
            <h3 className="text-xl font-black text-white">
              Official Election Results
            </h3>
          </div>
        </div>

        {electionId && (
          <Link
            to={`/student/results/${electionId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-sm transition shadow-sm self-start sm:self-auto"
          >
            <BarChart2 size={16} />
            <span>View Full Breakdown</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resultsList.length > 0 ? (
          resultsList.map((item, idx) => {
            const positionName =
              item.positionName || item.position_name || item.position_title || item.positionTitle || `Position #${idx + 1}`;
            
            // Winner candidate
            const winner = item.winner || (item.candidates && item.candidates[0]);
            const winnerName =
              winner?.candidateName ||
              winner?.candidate_name ||
              item.candidate_name ||
              item.candidateName ||
              "Winner Declared";

            const voteCount =
              winner?.voteCount ??
              winner?.vote_count ??
              item.vote_count ??
              item.total_votes ??
              0;

            const percentage =
              winner?.percentage ||
              (item.totalVotes > 0
                ? `${((voteCount / item.totalVotes) * 100).toFixed(1)}%`
                : null);

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex justify-between items-center gap-4 hover:bg-white/15 transition"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    {positionName}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Trophy size={16} className="text-amber-400 shrink-0" />
                    <p className="font-extrabold text-white text-base">
                      {winnerName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-amber-400">
                    {voteCount}
                  </span>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-purple-200">
                    {percentage ? `${percentage} Votes` : "Votes"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-purple-200 text-sm italic">
            Results are being tallied.
          </p>
        )}
      </div>
    </div>
  );
}
