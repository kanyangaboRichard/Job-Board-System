// src/pages/ApplyJob.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ApplyJob: React.FC = () => {
  const { id } = useParams(); // jobId
  const navigate = useNavigate();
  useAuth();

  const [coverLetter, setCoverLetter] = useState("");
  const [cvLink, setCvLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to apply.");
        return;
      }

      const res = await fetch(
        `http://localhost:3005/api/applications/${id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cover_letter: coverLetter,
            cv_link: cvLink,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Application failed");
        return;
      }

      setSuccess("Application submitted successfully!");
      setCoverLetter("");
      setCvLink("");

      // Redirect to home after short delay
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Apply error:", err);
      setError("Network error, could not submit application");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title mb-4">Apply for Job #{id}</h3>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Cover Letter</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">CV Link</label>
                  <input
                    type="url"
                    className="form-control"
                    value={cvLink}
                    onChange={(e) => setCvLink(e.target.value)}
                    placeholder="https://your-cv-link.com"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-success w-100">
                  Submit Application
                </button>
              </form>

              <button
                className="btn btn-outline-secondary w-100 mt-3"
                onClick={() => navigate(-1)}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
