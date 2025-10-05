import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Link, useNavigate } from "react-router-dom";

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        //  No token required — public endpoint for jobs
        const res = await fetch("http://localhost:3005/api/jobs");
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <p className="p-4 text-muted">Loading jobs...</p>;
  if (error) return <p className="p-4 text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold">Available Jobs</h2>
        {user ? (
          <p className="text-muted">
            Welcome, {user.name || "User"}! Browse the latest job postings below.
          </p>
        ) : (
          <p className="text-muted">
            Browse the latest job postings below.{" "}
            <Link to="/login">Log in</Link> to apply!
          </p>
        )}

        <img
          src="assets/banner.jpeg"
          className="img-fluid rounded mb-3"
          alt="Career opportunities"
        />

        <p className="text-muted">
          Find exciting opportunities to advance your career. Jobs are updated regularly — check back often!
        </p>
      </div>

      <div className="row">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{job.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{job.location}</h6>
                  <p className="card-text text-truncate">{job.description}</p>

                  <div className="mt-auto d-flex justify-content-between">
                    <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm">
                      View Details
                    </Link>

                    {/* ✅ Show Apply button only if logged in */}
                    {user ? (
                      <button
                        onClick={() => navigate(`/apply/${job.id}`)}
                        className="btn btn-primary btn-sm"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          navigate(`/login?redirect=/apply/${job.id}`)
                        }
                        className="btn btn-primary btn-sm"
                      >
                        Apply
                      </button>
                    )}
                  </div>
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
