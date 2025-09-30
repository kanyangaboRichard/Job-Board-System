import React, { useEffect, useState } from "react";
import ApplicationCard from "../components/ApplicationCard";
import { getApplications,respondToApplication,} from "../api/applications";
import type { Application } from "../api/applications";

const ApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Applications</h1>
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
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
      ))}
    </div>
  );
};

export default ApplicationPage;
