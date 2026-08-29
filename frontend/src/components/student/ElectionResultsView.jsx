import { Award } from "lucide-react";

export default function ElectionResultsView({ results }) {
  if (!results) return null;

  return (
    <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-purple-800 font-bold text-lg">
        <Award className="text-purple-600" />
        <span>Official Election Results</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(results) ? (
          results.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {item.candidate_name || item.candidateName}
                </p>
                <p className="text-xs text-gray-500">
                  {item.position_title || item.positionTitle}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-purple-700">
                  {item.vote_count || item.total_votes || 0}
                </span>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Votes
                </p>
              </div>
            </div>
          ))
        ) : (
          <pre className="text-xs p-4 bg-gray-50 rounded-lg overflow-x-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
