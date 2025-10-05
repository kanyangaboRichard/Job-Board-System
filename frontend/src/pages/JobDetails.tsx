import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`http://localhost:3005/api/jobs/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch job (${res.status})`);
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error("Failed to fetch job", err);
        setError("Unable to load job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <p className="text-danger">{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary mt-2">
          Go Back
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mt-5 text-center">
        <p className="text-muted">Job not found.</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary mt-2">
          Go Back
        </button>
      </div>
    );
  }

  const handleApply = () => {
    if (user) {
      navigate(`/apply/${id}`);
    } else {
      navigate(`/login?redirect=/apply/${id}`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-body">
          <h2 className="card-title fw-bold">{job.title}</h2>
          <h6 className="card-subtitle mb-3 text-muted">{job.location}</h6>

          <p className="card-text" style={{ whiteSpace: "pre-line" }}>
            {job.description}
          </p>

          <button className="btn btn-success mt-3" onClick={handleApply}>
            Apply Now
          </button>
          <button
            className="btn btn-outline-secondary mt-3 ms-2"
            onClick={() => navigate(-1)}
          >
            ← Back to Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
