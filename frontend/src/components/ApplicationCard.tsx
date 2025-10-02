import React from "react";

interface ApplicationCardProps {
  jobTitle: string;
  status: "pending" | "accepted" | "rejected";
  responseNote?: string | null;

  // Only shown if Admin is viewing
  applicantName?: string;
  applicantEmail?: string;
  coverLetter?: string;
  cvUrl?: string;

  // Admin actions
  isAdmin?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
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
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        {/* Job Title */}
        <h5 className="card-title">{jobTitle}</h5>

        {/* Applicant Info (Admin only) */}
        {isAdmin && (
          <div className="mb-2">
            <p className="card-text mb-1">
              <strong>Applicant:</strong> {applicantName}
            </p>
            <p className="card-text mb-1">
              <strong>Email:</strong> {applicantEmail}
            </p>
            {coverLetter && (
              <p className="card-text mb-1">
                <strong>Cover Letter:</strong> {coverLetter}
              </p>
            )}
            {cvUrl && (
              <p className="card-text">
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
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
        {isAdmin && status === "pending" && (
          <div className="mt-3 d-flex gap-2">
            <button onClick={onAccept} className="btn btn-sm btn-success">
              Accept
            </button>
            <button onClick={onReject} className="btn btn-sm btn-danger">
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
