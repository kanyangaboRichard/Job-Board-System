import React, { useEffect, useState } from "react";
import ApplicationCard from "../components/ApplicationCard";

type Application = {
  id: string | number;
  jobTitle: string;
  status: "pending" | "accepted" | "rejected";
  responseNote?: string;
};

const MyApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    // Fetch only the current user's applications
    fetch("/api/applications/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data: Application[]) => setApplications(data))
      .catch((err) =>
        console.error("Failed to fetch user applications:", err)
      );
  }, []);

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
