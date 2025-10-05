import React, { useEffect, useState } from "react";
import ApplicationCard from "../components/ApplicationCard";
import { getUserApplications, type Application } from "../api/applications";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const MyApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Only fetch when token exists
    if (!token) return;

    const fetchApps = async () => {
      try {
        const data = await getUserApplications();
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch user applications:", err);
        setError("Could not load your applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [token]); // depend on token

  if (loading) {
    return <p className="p-4 text-muted">Loading your applications...</p>;
  }

  if (error) {
    return <p className="p-4 text-danger">{error}</p>;
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">My Applications</h1>

      {applications.length === 0 ? (
        <p className="text-muted">You haven’t applied for any jobs yet.</p>
      ) : (
        <div className="row">
          {applications.map((app) => (
            <div key={app.id} className="col-md-6 col-lg-4 mb-4">
              <ApplicationCard
                jobTitle={app.jobTitle}
                status={app.status}
                responseNote={app.responseNote}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationPage;
