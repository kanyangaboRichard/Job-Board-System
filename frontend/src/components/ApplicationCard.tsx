import React, { useState } from "react";

interface ApplicationCardProps {
  jobTitle: string;
  status: "pending" | "accepted" | "rejected";
  responseNote?: string | null;

  // Admin viewing extras
  applicantName?: string;
  applicantEmail?: string;
  coverLetter?: string;
  cvUrl?: string;

  // Admin actions
  isAdmin?: boolean;
  onAccept?: () => void;
  onReject?: (reason: string) => void; 
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  jobTitle,
  status,
  responseNote,
  applicantName,
  applicantEmail,
  coverLetter,
  cvUrl,
  isAdmin = false,
  onAccept,
  onReject,
}) => {
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRejectConfirm = () => {
    if (!reason.trim()) {
      setErrorMsg(" Please provide a rejection reason.");
      return;
    }
    onReject?.(reason.trim());
    setShowReasonBox(false);
    setReason("");
    setErrorMsg("");
  };

  return (
    <div className="card shadow-sm h-100 border-0">
      <div className="card-body d-flex flex-column">
        {/* Job Title */}
        <h5 className="card-title text-primary">{jobTitle}</h5>

        {/* Applicant Info (Admin only) */}
        {isAdmin && (
          <div className="mb-2 small">
            <p className="mb-1">
              <strong>Applicant:</strong> {applicantName}
            </p>
            <p className="mb-1">
              <strong>Email:</strong> {applicantEmail}
            </p>
            {coverLetter && (
              <p className="mb-1">
                <strong>Cover Letter:</strong> {coverLetter}
              </p>
            )}
            {cvUrl && (
              <p className="mb-1">
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none text-primary"
                >
                   View CV
                </a>
              </p>
            )}
          </div>
        )}

        {/* Status */}
        <div className="mt-auto">
          <span className="fw-bold">Status: </span>
          <span
            className={`badge ${
              status === "pending"
                ? "bg-warning text-dark"
                : status === "accepted"
                ? "bg-success"
                : "bg-danger"
            }`}
          >
            {status.toUpperCase()}
          </span>
        </div>

        {/* Response Note */}
        {responseNote && (
          <p className="mt-2 text-muted fst-italic">Note: {responseNote}</p>
        )}

        {/* Admin Actions */}
        {isAdmin && status === "pending" && !showReasonBox && (
          <div className="mt-3 d-flex gap-2">
            <button onClick={onAccept} className="btn btn-sm btn-success">
              Accept
            </button>
            <button
              onClick={() => setShowReasonBox(true)}
              className="btn btn-sm btn-danger"
            >
              Reject
            </button>
          </div>
        )}

        {/* Rejection Reason Box */}
        {showReasonBox && (
          <div className="mt-3 border rounded p-2 bg-light">
            <label className="form-label fw-semibold small">
              Reason for Rejection
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type reason here..."
            />
            {errorMsg && <p className="text-danger small mt-1">{errorMsg}</p>}

            <div className="d-flex justify-content-end gap-2 mt-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowReasonBox(false);
                  setReason("");
                  setErrorMsg("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-danger"
                disabled={!reason.trim()}
                onClick={handleRejectConfirm}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
