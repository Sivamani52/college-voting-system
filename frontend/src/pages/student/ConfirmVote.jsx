import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ConfirmVote() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    election,
    positions,
    candidates,
    selectedCandidates,
  } = location.state || {};

  if (
    !election ||
    !positions ||
    !candidates ||
    !selectedCandidates
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">

          <h1 className="text-xl font-bold">
            Voting session not found
          </h1>

          <button
            onClick={() => navigate("/student")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go to Dashboard
          </button>

        </div>
      </div>
    );
  }

  const getCandidate = (candidateId) => {
    return candidates.find(
      (candidate) =>
        Number(candidate.id) ===
        Number(candidateId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-5">

          <button
            onClick={() =>
              navigate(
                `/student/elections/${election.id}`
              )
            }
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Election
          </button>

        </div>
      </header>


      <main className="max-w-4xl mx-auto px-6 py-10">

        <div className="text-center mb-8">

          <div className="mx-auto w-fit p-4 rounded-full bg-blue-50 text-blue-600">
            <CheckCircle2 size={32} />
          </div>

          <h1 className="text-3xl font-bold mt-4">
            Review Your Vote
          </h1>

          <p className="text-gray-500 mt-2">
            Please carefully review your selections.
          </p>

        </div>


        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

          <div className="p-6 border-b">

            <h2 className="text-xl font-bold">
              {election.title}
            </h2>

          </div>


          <div className="divide-y">

            {positions.map((position) => {

              const candidateId =
                selectedCandidates[position.id];

              const candidate =
                getCandidate(candidateId);

              return (
                <div
                  key={position.id}
                  className="p-6 flex items-center justify-between gap-5"
                >

                  <div>

                    <p className="text-sm text-gray-500">
                      {position.name}
                    </p>

                    <p className="font-semibold text-lg mt-1">
                      {candidate?.full_name ||
                        candidate?.name ||
                        `Candidate ${candidateId}`}
                    </p>

                  </div>

                  {candidate?.photo_url && (
                    <img
                      src={candidate.photo_url}
                      alt="Candidate"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}

                </div>
              );
            })}

          </div>

        </div>


        {/* Warning */}

        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">

          <p className="font-semibold text-yellow-900">
            Important
          </p>

          <p className="text-sm text-yellow-800 mt-1">
            Once your vote is submitted, you cannot change
            your selections.
          </p>

        </div>


        {/* Buttons */}

        <div className="mt-6 flex flex-col sm:flex-row gap-4">

          <button
            onClick={() =>
              navigate(
                `/student/elections/${election.id}`
              )
            }
            className="flex-1 border border-gray-300 rounded-lg py-3 font-semibold hover:bg-white"
          >
            Change Selection
          </button>

          <button
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700"
          >
            Submit Vote
          </button>

        </div>

      </main>

    </div>
  );
}