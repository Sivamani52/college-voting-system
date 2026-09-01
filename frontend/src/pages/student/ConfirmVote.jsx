import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Vote,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Home,
  FileCheck,
} from "lucide-react";
import { submitVotes } from "../../services/voteService";
import Navbar from "../../components/common/Navbar";
import Alert from "../../components/common/Alert";

export default function ConfirmVote() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    election,
    positions = [],
    candidates = [],
    selectedCandidates = {},
  } = location.state || {};

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // If no state was passed, show session not found
  if (!election || !positions || positions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar subtitle="Review Ballot" />
        <main className="max-w-md mx-auto my-auto p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Voting Session Found
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Please select an active election and choose your candidates first before reviewing.
          </p>
          <button
            onClick={() => navigate("/student")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            <ArrowLeft size={18} />
            Go to Student Dashboard
          </button>
        </main>
      </div>
    );
  }

  // Find candidate object by ID
  const getCandidate = (candidateId) => {
    return candidates.find(
      (candidate) => Number(candidate.id) === Number(candidateId)
    );
  };

  // Build the list of selections
  const voteList = [];
  positions.forEach((pos) => {
    const candidateId = selectedCandidates[pos.id];
    if (candidateId) {
      voteList.push({
        position: pos,
        candidate: getCandidate(candidateId),
        position_id: Number(pos.id),
        candidate_id: Number(candidateId),
      });
    }
  });

  const unvotedPositions = positions.filter(
    (pos) => !selectedCandidates[pos.id]
  );

  // Handle final submission
  const handleSubmitVote = async () => {
    if (voteList.length === 0) {
      setError("Please select at least one candidate before submitting your vote.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        election_id: Number(election.id),
        votes: voteList.map((item) => ({
          position_id: Number(item.position_id),
          candidate_id: Number(item.candidate_id),
        })),
      };

      const result = await submitVotes(payload);

      setSuccessData({
        message: result.message || "All votes have been successfully submitted and recorded.",
        electionTitle: election.title,
        submittedCount: voteList.length,
        submittedVotes: voteList,
        timestamp: result.voted_at || new Date().toISOString(),
      });
    } catch (err) {
      console.error("Vote submission error:", err);
      const serverMessage =
        err.response?.data?.message ||
        "Failed to submit your vote. Please check your connection and try again.";
      setError(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================================
  // SUCCESS STATE (OFFICIAL VOTE RECEIPT)
  // ========================================================
  if (successData) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Navbar subtitle="Vote Receipt" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />

            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50/50">
              <CheckCircle2 size={44} className="animate-pulse" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
              <ShieldCheck size={14} /> Official Ballot Cast
            </span>

            <h1 className="text-3xl font-extrabold text-gray-900">
              Vote Cast Successfully!
            </h1>

            <p className="text-gray-600 mt-2 max-w-lg mx-auto text-sm">
              Your votes for <strong className="text-gray-900">{successData.electionTitle}</strong> have been cryptographically verified and securely recorded in the system.
            </p>

            <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar size={14} className="text-blue-600" />
                  Recorded At: {new Date(successData.timestamp).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 font-semibold text-emerald-700">
                  <FileCheck size={14} /> {successData.submittedCount} Position(s) Voted
                </div>
              </div>

              <div className="divide-y divide-gray-200/70">
                {successData.submittedVotes.map((item) => (
                  <div
                    key={item.position_id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                        {item.position.name || item.position.title}
                      </p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">
                        {item.candidate?.full_name ||
                          item.candidate?.name ||
                          `Candidate #${item.candidate_id}`}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 size={12} /> Recorded
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-left flex items-start gap-3">
              <Lock size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                To guarantee election integrity, submissions cannot be modified or recast. You have fulfilled your voting duty for these positions.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/student")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                <Home size={18} /> Return to Dashboard
              </button>
              <button
                onClick={() => navigate(`/student/elections/${election.id}`)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                <Vote size={18} /> View Election Details
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ========================================================
  // REVIEW & CONFIRMATION BALLOT
  // ========================================================
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar subtitle="Ballot Confirmation" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Back navigation */}
        <div>
          <button
            onClick={() => navigate(`/student/elections/${election.id}`)}
            disabled={submitting}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Back to Election Candidates
          </button>
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" message={error} />}

        {/* Hero Banner */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Vote size={16} /> Final Review & Vote Submission
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {election.title}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Please double-check your chosen candidate for each position below.
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-gray-100 sm:pl-6">
              <span className="text-xs text-gray-500 font-medium">Selected Votes</span>
              <p className="text-2xl font-black text-blue-600">
                {voteList.length}{" "}
                <span className="text-sm font-normal text-gray-500">
                  / {positions.length}
                </span>
              </p>
            </div>
          </div>

          {/* Unvoted positions alert if any */}
          {unvotedPositions.length > 0 && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Notice:</span> You have not selected candidates for:{" "}
                <strong>
                  {unvotedPositions.map((p) => p.name || p.title).join(", ")}
                </strong>
                . You may still submit votes for your selected positions, or go back to complete your selections.
              </div>
            </div>
          )}

          {/* Positions Ballot Cards */}
          <div className="mt-6 divide-y divide-gray-100 border rounded-2xl overflow-hidden bg-gray-50/50">
            {positions.map((pos) => {
              const candidateId = selectedCandidates[pos.id];
              const candidate = getCandidate(candidateId);

              return (
                <div
                  key={pos.id}
                  className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    candidate ? "bg-white" : "bg-gray-50/80"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {pos.name || pos.title}
                    </span>
                    {pos.description && (
                      <p className="text-xs text-gray-500">{pos.description}</p>
                    )}

                    {candidate ? (
                      <div className="flex items-center gap-3 pt-2">
                        {candidate.photo_url ? (
                          <img
                            src={candidate.photo_url}
                            alt={candidate.full_name || candidate.name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs">
                            {(candidate.full_name || candidate.name || "C").charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {candidate.full_name || candidate.name}
                          </h4>
                          {candidate.student_id && (
                            <p className="text-xs text-gray-500 font-mono">
                              ID: {candidate.student_id}
                            </p>
                          )}
                          {candidate.manifesto && (
                            <p className="text-xs text-gray-600 italic mt-0.5 line-clamp-1">
                              &ldquo;{candidate.manifesto}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 text-sm text-gray-400 italic">
                        No candidate selected for this position
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center">
                    {candidate ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={16} /> Selected Choice
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">
                        Skipped / Empty
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Irreversible Confirmation Warning */}
          <div className="mt-6 p-4 rounded-2xl bg-gray-100 border border-gray-200 flex items-start gap-3">
            <Lock size={18} className="text-gray-700 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <strong className="font-semibold text-gray-900">
                Single Transaction Guarantee:
              </strong>{" "}
              All selected votes will be recorded atomically in one single transaction. Once confirmed, your ballot cannot be revised or cast again.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate(`/student/elections/${election.id}`)}
              disabled={submitting}
              className="flex-1 border border-gray-300 rounded-xl py-3.5 px-4 font-semibold text-gray-700 hover:bg-gray-50 transition text-center disabled:opacity-50"
            >
              Modify Selections
            </button>

            <button
              type="button"
              onClick={handleSubmitVote}
              disabled={submitting || voteList.length === 0}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 px-4 font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recording Votes...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Confirm & Submit {voteList.length} Vote(s)
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}