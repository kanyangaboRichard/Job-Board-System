import React, { useEffect, useState } from "react";
import ApplicationCard from "../components/ApplicationCard";
import { getApplications, respondToApplication } from "../api/applications";
import type { Application } from "../api/applications";

const ApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");

  // Fetch all applications on mount
  useEffect(() => {
    getApplications()
      .then((data) => setApplications(data))
      .catch((err) => console.error("Failed to fetch applications:", err));
  }, []);

  // Handle Accept/Reject + optional note
  const handleRespond = (
    id: number | string,
    status: "accepted" | "rejected",
    responseNote?: string
  ) => {
    respondToApplication(id, status, responseNote)
      .then((updated) => {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id
              ? { ...app, status: updated.status, responseNote: updated.responseNote }
              : app
          )
        );
      })
      .catch((err) => console.error("Failed to update application:", err));
  };

  // Filter applications by applicant name/email
  const filteredApplications = applications.filter((app) =>
    [app.applicantName, app.applicantEmail]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <h1 className="mb-4">All Applications</h1>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by applicant name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredApplications.length === 0 ? (
        <p className="text-muted">No applications found.</p>
      ) : (
        <div className="row">
          {filteredApplications.map((app) => (
            <div key={app.id} className="col-md-6 col-lg-4 mb-4">
              <ApplicationCard
                jobTitle={app.jobTitle}
                applicantName={app.applicantName}
                applicantEmail={app.applicantEmail}
                coverLetter={app.coverLetter}
                cvUrl={app.cvUrl}
                status={app.status}
                responseNote={app.responseNote}
                isAdmin
                onAccept={() =>
                  handleRespond(app.id, "accepted", "Congratulations! You're shortlisted.")
                }
                onReject={() =>
                  handleRespond(app.id, "rejected", "Unfortunately, we won’t move forward.")
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationPage;
