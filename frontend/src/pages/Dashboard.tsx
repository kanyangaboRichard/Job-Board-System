import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import "./Dashboard.css"; //CSS for background
import {getJobs} from "../api/jobs";

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
  const [options, setOptions] = useState<Option[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 2;

  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();

  // compute search options
  const computeOptions = (query = ""): Option[] => {
    const normalized = query.trim().toLowerCase();
    return jobs
      .filter((j) =>
        normalized ? j.title.toLowerCase().includes(normalized) : true
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 5)
      .map((j) => ({ value: j.id, label: j.title }));
  };

  useEffect(() => {
    const storedToken = token || localStorage.getItem("token");

    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
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

    const fetchJobs = async () => {
      try {
        console.log("Fetching jobs from API...");
        const data = await getJobs();
        console.log("Jobs fetched:", data);
        const jobsData = data as Job[];
        setJobs(jobsData);

        const initial = jobsData
          .slice()
          .sort((a: Job, b: Job) => a.title.localeCompare(b.title))
          .slice(0, 5)
          .map((j: Job) => ({ value: j.id, label: j.title }));
        setOptions(initial);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs.");
      }
    };

    const fetchApplications = async () => {
      if (!storedToken) return;
      try {
        const res = await fetch("http://localhost:3005/api/applications/user", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data: Application[] = await res.json();
          setAppliedJobs(data.map((a) => a.job_id));
        }
      } catch {
        console.error("Failed to load applications");
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchJobs(), fetchApplications()]);
      setLoading(false);
    };

    loadData();
  }, [token]);

  if (loading) return <p className="p-4 text-muted">Loading jobs...</p>;
  if (error) return <p className="p-4 text-danger">{error}</p>;

  // pagination math
  const indexOfLast = currentPage * jobsPerPage;
  const indexOfFirst = indexOfLast - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div className="animated-bg min-vh-100">
      <div className="container mt-5 py-5">
        
        {/* Title and Search */}
        <div className="sticky-top bg-light py-3 mb-4" style={{ zIndex: 1020 }}>
          <div className="text-center mb-2">
            <h2 className="fw-bold gradient-text">Available Jobs</h2>
            {token ? (
              <p className="text-muted mb-0">
                Welcome, <strong>{username}</strong>! Browse the latest jobs below.
              </p>
            ) : (
              <p className="text-muted mb-0">
                Browse the latest jobs. <Link to="/login">Log in</Link> to apply!
              </p>
            )}
          </div>

          <div className="d-flex justify-content-center mt-3">
            <div style={{ minWidth: 280, maxWidth: 640, width: "100%" }}>
              <Select
                options={options}
                placeholder="Search jobs..."
                isClearable
                onChange={(selected) =>
                  selected && navigate(`/jobs/${(selected as Option).value}`)
                }
                onInputChange={(inputValue, { action }) => {
                  if (action === "input-change") {
                    setOptions(computeOptions(inputValue));
                  }
                }}
                menuPlacement="auto"
                styles={{
                  menu: (provided) => ({ ...provided, zIndex: 2000 }),
                }}
              />
            </div>
          </div>
        </div>

        {/* Image banners with links */}
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mb-4">
          {[
            { src: "/assets/banner.jpeg", text: "Finance Jobs", link: "/category/finance" },
            { src: "/assets/banner2.jpeg", text: "Security Jobs", link: "/category/security" },
            { src: "/assets/markets.jpeg", text: "Marketing Jobs", link: "/category/marketing" },
            { src: "/assets/Finance.jpeg", text: "Accounting Jobs", link: "/category/accounting" },
            { src: "/assets/Tech.jpeg", text: "Tech Jobs", link: "/category/tech" },
            { src: "/assets/HR.jpeg", text: "HR Jobs", link: "/category/hr" },
          ].map((item) => (
            <div key={item.link} className="text-center">
              <img
                src={item.src}
                alt={item.text}
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: 200, maxWidth: 300, cursor: "pointer" }}
                onClick={() => navigate(item.link)}
              />
              <div>
                <Link to={item.link} className="text-primary fw-semibold small text-decoration-none">
                  {item.text}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Job Cards */}
        <div className="row">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => {
              const applied = appliedJobs.includes(Number(job.id));
              return (
                <div key={job.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card shadow-sm h-100 position-relative">
                    {applied && (
                      <span className="badge bg-success position-absolute top-0 end-0 m-2">
                        Applied
                      </span>
                    )}
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{job.title}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{job.location}</h6>
                      {job.deadline && (
                        <p className="text-danger small mb-1">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </p>
                      )}
                      <p className="card-text text-truncate">{job.description}</p>

                      <div className="mt-auto d-flex justify-content-between">
                        <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm">
                          View Details
                        </Link>
                        {token ? (
                          <button
                            onClick={() =>
                              !applied && navigate(`/apply/${job.id}`)
                            }
                            className={`btn btn-sm ${
                              applied ? "btn-secondary disabled" : "btn-primary"
                            }`}
                            disabled={applied}
                          >
                            {applied ? "Already Applied" : "Apply"}
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
              <p className="text-muted">No jobs available.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
            <button
              className="btn btn-outline-primary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-primary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
