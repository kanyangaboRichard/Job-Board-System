// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await fetch("http://localhost:3005/jobs");
      const data = await res.json();
      setJobs(data);
    };
    fetchJobs();
  }, []);

  return (
    <div className="container mt-4">
      <h2>👑 Admin Dashboard</h2>
      <p>Welcome {user?.role}</p>

      <div className="list-group mt-3">
        {jobs.map((job) => (
          <div key={job.id} className="list-group-item">
            <h5>{job.title}</h5>
            <p>{job.location}</p>
            <button className="btn btn-sm btn-warning me-2">Edit</button>
            <button className="btn btn-sm btn-danger">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
