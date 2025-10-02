import React, { useEffect, useState } from "react";
import ApplicationCard from "../components/ApplicationCard";
import { getUserApplications, type Application } from "../api/applications";

const MyApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserApplications()
      .then(setApplications)
      .catch((err) => {
        console.error("Failed to fetch user applications:", err);
        setError("Could not load your applications.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading your applications...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Applications</h1>

      {applications.length === 0 ? (
        <p className="text-gray-600">You haven’t applied for any jobs yet.</p>
      ) : (
        applications.map((app) => (
          <ApplicationCard
            key={app.id}
            jobTitle={app.jobTitle}
            status={app.status}
            responseNote={app.responseNote}
          />
        ))
      )}
    </div>
  );
};

export default MyApplicationPage;
