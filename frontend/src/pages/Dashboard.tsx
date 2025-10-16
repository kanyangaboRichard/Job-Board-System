import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // correct import

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
  deadline?: string; 
}

interface Application {
  job_id: number;
  status: "pending" | "accepted" | "rejected";
}

interface DecodedToken {
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
}

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("User");

  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = token || localStorage.getItem("token");

    // Decode JWT to show user's name
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Token expired. Logging out...");
          localStorage.removeItem("token");
          setUsername("User");
        } else {
          setUsername(
            decoded.name ||
              (decoded.email ? decoded.email.split("@")[0] : "User")
          );
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }

    // Fetch all jobs
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:3005/api/jobs");
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      }
    };

    //  Fetch user applications
    const fetchUserApplications = async () => {
      if (!storedToken) return;
      try {
        const res = await fetch("http://localhost:3005/api/applications/user", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data: Application[] = await res.json();
          const appliedIds = data.map((app) => app.job_id);
          setAppliedJobs(appliedIds);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchJobs(), fetchUserApplications()]);
      setLoading(false);
    };

    loadData();
  }, [token]);

  if (loading) return <p className="p-4 text-muted">Loading jobs...</p>;
  if (error) return <p className="p-4 text-danger">{error}</p>;

  return (
    <div className="bg-light min-vh-100">
      <div className="container mt-5 py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Available Jobs</h2>
          {token ? (
            <p className="text-muted">
              Welcome, <strong>{username}</strong>! Browse the latest job postings below.
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
            Find exciting opportunities to advance your career. Jobs are updated
            regularly — check back often!
          </p>
        </div>

        <div className="row">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const alreadyApplied = appliedJobs.includes(job.id);
              return (
                <div key={job.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card shadow-sm h-100 position-relative">
                    {alreadyApplied && (
                      <span
                        className="badge bg-success position-absolute top-0 end-0 m-2"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Applied
                      </span>
                    )}

                    <div className="card-body d-flex flex-column">
                      {/*  Job title */}
                      <h5 className="card-title">{job.title}</h5>

                      {/* Location (muted) */}
                      <h6 className="card-subtitle mb-2 text-muted">
                        {job.location}
                      </h6>

                      {/* Deadline */}
                      {job.deadline && (
                        <p className="text-danger small mb-1">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </p>
                      )}
                      {/*  Description */}
                      <p className="card-text text-truncate">{job.description}</p>
                      
                      {/*  Buttons */}
                      <div className="mt-auto d-flex justify-content-between">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          View Details
                        </Link>

                        {token ? (
                          <button
                            onClick={() =>
                              !alreadyApplied && navigate(`/apply/${job.id}`)
                            }
                            className={`btn btn-sm ${
                              alreadyApplied
                                ? "btn-secondary disabled"
                                : "btn-primary"
                            }`}
                            disabled={alreadyApplied}
                          >
                            {alreadyApplied ? "Already Applied" : "Apply"}
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
              );
            })
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">No jobs available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
