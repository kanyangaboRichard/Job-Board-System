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
    <div className="border rounded-lg shadow-md p-4 mb-4 bg-white">
      <h2 className="text-lg font-semibold text-gray-800">{jobTitle}</h2>

      {/* User Info (Admin only) */}
      {isAdmin && (
        <div className="mt-2">
          <p>
            <span className="font-medium">Applicant:</span> {applicantName}
          </p>
          <p>
            <span className="font-medium">Email:</span> {applicantEmail}
          </p>
          {coverLetter && (
            <p className="mt-2">
              <span className="font-medium">Cover Letter:</span> {coverLetter}
            </p>
          )}
          {cvUrl && (
            <p className="mt-2">
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View CV
              </a>
            </p>
          )}
        </div>
      )}

      {/* Status */}
      <div className="mt-3">
        <span className="font-medium">Status:</span>{" "}
        <span
          className={`px-2 py-1 rounded text-sm ${
            status === "pending"
              ? "bg-yellow-200 text-yellow-800"
              : status === "accepted"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {status.toUpperCase()}
        </span>
      </div>

      {/* Response Note */}
      {responseNote && (
        <p className="mt-2 text-gray-600 italic">Note: {responseNote}</p>
      )}

      {/* Admin Actions */}
      {isAdmin && status === "pending" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onAccept}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
