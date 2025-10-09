import React, { useEffect, useState } from "react";
import ApplicationCard from "../components/ApplicationCard";
import {
  getApplications,
  respondToApplication,
  type Application,
} from "../api/applications";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const ApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Get token from Redux (same as MyApplicationPage)
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!token) return;

    const fetchApplications = async () => {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Could not load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  // ✅ Handle Accept/Reject actions
  const handleRespond = async (
    id: number | string,
    status: "accepted" | "rejected",
    responseNote?: string
  ) => {
    try {
      const updated = await respondToApplication(id, status, responseNote);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: updated.status,
                responseNote: updated.responseNote,
              }
            : app
        )
      );
    } catch (err) {
      console.error("Failed to update application:", err);
      alert("Failed to update application. Please try again.");
    }
  };

  // ✅ Filter applications by applicant name or email
  const filteredApplications = applications.filter((app) =>
    [app.applicantName, app.applicantEmail]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ✅ Consistent loading & error handling
  if (loading) {
    return <p className="p-4 text-muted">Loading applications...</p>;
  }

  if (error) {
    return <p className="p-4 text-danger">{error}</p>;
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">All Applications</h1>

      {/* 🔍 Search bar */}
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
                  handleRespond(
                    app.id,
                    "accepted",
                    "Congratulations! You're shortlisted."
                  )
                }
                // ✅ Pass the rejection reason dynamically from ApplicationCard
                onReject={(reason) =>
                  handleRespond(app.id, "rejected", reason)
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
