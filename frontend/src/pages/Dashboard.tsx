import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:3005/jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">💼 Available Jobs</h2>
        <p className="text-muted">
          Browse the latest job postings and click on one to see details.
        </p>
      </div>

      {/* Job list */}
      <div className="row">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{job.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                     {job.location}
                  </h6>
                  <p className="card-text text-truncate">
                    {job.description}
                  </p>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn btn-primary mt-auto"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">No jobs available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;