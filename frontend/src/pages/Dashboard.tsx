import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import {jwtDecode} from "jwt-decode"; // correct import

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

interface Option {
  value: number;
  label: string;
}

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("User");
  const [options, setOptions] = useState<Option[]>([]); // for react-select

  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();

  // helper: produce top-5 alphabetical options, optionally filtered by query
  const computeOptions = (query = ""): Option[] => {
    const normalized = query.trim().toLowerCase();
    const filtered = jobs
      .filter((j) =>
        normalized ? j.title.toLowerCase().includes(normalized) : true
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 5)
      .map((j) => ({ value: j.id, label: j.title }));
    return filtered;
  };

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
        const data: Job[] = await res.json();
        setJobs(data);
        // set initial top-5 alphabetical options
        const initial = [...data]
          .sort((a, b) => a.title.localeCompare(b.title))
          .slice(0, 5)
          .map((j) => ({ value: j.id, label: j.title }));
        setOptions(initial);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      }
    };

    // Fetch user applications
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

  // update options whenever jobs change (keeps top-5)
  useEffect(() => {
    setOptions(computeOptions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  if (loading) return <p className="p-4 text-muted">Loading jobs...</p>;
  if (error) return <p className="p-4 text-danger">{error}</p>;

  return (
    <div className="bg-light min-vh-100">
      <div className="container mt-5 py-5">
        {/* Sticky header: title (bold) + search (react-select) */}
        <div
          className=" bg-light py-3 mb-4"
          style={{ zIndex: 1020 }}
        >
          <div className="text-center mb-2">
            <h2 className="fw-bold m-0">Available Jobs</h2>
            {token ? (
              <p className="text-muted mb-0">
                Welcome, <strong>{username}</strong>! Browse the latest job
                postings below.
              </p>
            ) : (
              <p className="text-muted mb-0">
                Browse the latest job postings below.{" "}
                <Link to="/login">Log in</Link> to apply!
              </p>
            )}
          </div>

          {/* react-select filster */}
          <div className="d-flex justify-content-center mt-3 ">
            <div style={{ minWidth: 280, maxWidth: 640, width: "100%" }}>
              <Select
                options={options}
                placeholder="Search jobs..."
                isClearable
                onChange={(selected) => {
                  if (selected) {
                    navigate(`/jobs/${(selected as Option).value}`);
                  }
                }}
                onInputChange={(inputValue, { action }) => {
                  // update options to top-5 matching input

                  if (action === "input-change" || action === "input-blur") {
                    setOptions(computeOptions(inputValue));
                  }
                }}
                // ensure menu shows when focused even without typing
                menuPlacement="auto"
                styles={{
                  menu: (provided) => ({ ...provided, zIndex: 2000 }),
                }}
              />
            </div>
          </div>
        </div>

        {/*Images section */}
        <div className="d-flex flex-row flex-wrap justify-content-center align-items-center gap-3 mb-4">
          <img
            src="/assets/banner.jpeg"
            alt="isco_banner"
            className="img-fluid"
            style={{ maxHeight: 200, maxWidth: 320 }}
          />
          <img
            src="/assets/banner2.jpeg"
            alt="customer_services 2"
            className="img-fluid"
            style={{ maxHeight: 200, maxWidth: 320 }}
          />
          <img
            src="/job_search_illustration.png"
            alt="Job Search Illustration 3"
            className="img-fluid"
            style={{ maxHeight: 200, maxWidth: 320 }}
          />
          <img
            src="/job_search_illustration.png"
            alt="Job Search Illustration 4"
            className="img-fluid"
            style={{ maxHeight: 200, maxWidth: 320 }}
          />
          <img
            src="/job_search_illustration.png"
            alt="Job Search Illustration 5"
            className="img-fluid"
            style={{ maxHeight: 200, maxWidth: 320 }}
          />
          <img
            src="/job_search_illustration.png"
            alt="Job Search Illustration 6"
            className="img-fluid"
            style={{ maxHeight: 200, maxWidth: 320 }}
          />
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
                              alreadyApplied ? "btn-secondary disabled" : "btn-primary"
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
