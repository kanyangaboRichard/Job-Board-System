import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import axios from "axios";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";


// TypeScript Interfaces

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
  company_name: string;
  company_id: number;
  salary: number;
  deadline?: string;
}

interface Company {
  company_id: number;
  company_name: string;
}

interface Stats {
  users: number;
  jobs: number;
  applications: number;
  pending: number;
  accepted: number;
  rejected: number;
}

interface Option {
  value: string | number;
  label: string;
}


// Main Component

const AdminDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);


  // State Management
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [companyId, setCompanyId] = useState<string>("");

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination & Filter
  const [selectedCompany, setSelectedCompany] = useState<Option | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  
  // Fetch Data
  

  // Fetch all jobs
  useEffect(() => {
    if (!token) return;
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data: Job[] = await res.json();

        const sanitizedJobs = data.map((j) => ({
          ...j,
          salary: Number(j.salary) || 0,
        }));

        setJobs(sanitizedJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [token]);

  // Fetch companies
  useEffect(() => {
    if (!token) return;
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch companies");
        const data: Company[] = await res.json();
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, [token]);

  // Fetch admin stats
  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const res = await axios.get<Stats>(
          `${import.meta.env.VITE_API_URL}/admin/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [token]);

  
  // Filtering & Pagination

  const companyOptions: Option[] = useMemo(() => {
    const uniqueCompanies = Array.from(new Set(jobs.map((j) => j.company_name)));
    return uniqueCompanies.map((comp) => ({ value: comp, label: comp }));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (!selectedCompany) return jobs;
    return jobs.filter((job) => job.company_name === selectedCompany.value);
  }, [jobs, selectedCompany]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  useEffect(() => setCurrentPage(1), [selectedCompany]);

  
  // Save / Update Job
  
  const handleSave = async () => {
    const salaryNum = Number(salary);
    const company_id = Number(companyId);

    if (
      !title.trim() ||
      !location.trim() ||
      !description.trim() ||
      !deadline.trim() ||
      !companyId.trim()
    ) {
      setError("Please fill in all fields, including company and deadline.");
      return;
    }

    if (isNaN(salaryNum) || salaryNum <= 0) {
      setError("Please enter a valid salary greater than 0.");
      return;
    }

    try {
      const method = editingJob ? "PATCH" : "POST";
      const url = editingJob
        ? `${import.meta.env.VITE_API_URL}/jobs/${editingJob.id}`
        : `${import.meta.env.VITE_API_URL}/jobs`;

      const body = JSON.stringify({
        title,
        location,
        description,
        salary: salaryNum,
        deadline,
        company_id,
        posted_by: user?.id || user?.name || "admin",
      });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!res.ok) throw new Error("Failed to save job");
      const savedJob: Job = await res.json();

      setJobs((prev) =>
        editingJob
          ? prev.map((job) => (job.id === savedJob.id ? savedJob : job))
          : [savedJob, ...prev]
      );

      resetForm();
    } catch (err) {
      console.error("Error saving job:", err);
      setError("Could not save job. Please try again.");
    }
  };

  
  // Delete Job
  
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await fetch(`https://job-board-system.onrender.com/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete job");
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      console.error("Error deleting job:", err);
      setError("Could not delete job. Please try again.");
    }
  };

  
  // Reset Form

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setSalary("");
    setDescription("");
    setDeadline("");
    setEditingJob(null);
    setShowModal(false);
    setError(null);
    setCompanyId("");
  };

  
  // Render Section

  if (!token) return <p className="p-4 text-muted">Please log in as an admin.</p>;
  if (user?.role !== "admin")
    return <p className="p-4 text-danger">Access denied.</p>;
  if (loading) return <p className="p-4 text-muted">Loading jobs...</p>;

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="fw-bold text-primary">Admin Dashboard</h2>
          <p className="text-muted mb-2">
            Welcome, {user?.name || "Admin"}! Manage all job postings below.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
          >
            + Add Job
          </button>
        </div>

        {/* Company filter */}
        <div style={{ minWidth: 250 }}>
          <Select
            options={companyOptions}
            value={selectedCompany}
            onChange={(opt) => setSelectedCompany(opt)}
            isClearable
            placeholder="Filter by company..."
          />
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-info rounded-3 shadow-sm p-3 mb-4">
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {Object.entries(stats).map(([key, value]) => (
              <div
                key={key}
                className="card text-center border-0 shadow-sm"
                style={{
                  width: "130px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "10px",
                }}
              >
                <div className="card-body p-2">
                  <h6 className="text-capitalize text-muted mb-1">{key}</h6>
                  <p className="fw-bold text-info fs-5 mb-0">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Cards */}
      <div className="row">
        {paginatedJobs.length > 0 ? (
          paginatedJobs.map((job) => (
            <div key={job.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{job.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {job.company_name} — {job.location}
                  </h6>

                  {job.deadline && (
                    <p className="text-danger small mb-1">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  )}

                  <p className="card-text text-truncate">{job.description}</p>
                  <p className="fw-semibold mt-2">
                    Salary:{" "}
                    {job.salary > 0
                      ? `${job.salary.toLocaleString()} RWF`
                      : "Not specified"}
                  </p>

                  <div className="mt-auto d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setEditingJob(job);
                        setTitle(job.title);
                        setLocation(job.location);
                        setSalary(String(job.salary));
                        setDescription(job.description);
                        setDeadline(job.deadline || "");
                        setCompanyId(String(job.company_id));
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(job.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">No job postings found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={handlePrevPage}
          >
            Previous
          </button>
          <span className="fw-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={handleNextPage}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal: Add/Edit Job */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingJob ? "Edit Job" : "Add Job"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={resetForm}
                ></button>
              </div>

              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}

                <form className="vstack gap-3">
                  <input
                    className="form-control"
                    placeholder="Job Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  {/* Company Selector */}
                  <CreatableSelect
                    options={companies.map((c) => ({
                      value: c.company_id,
                      label: c.company_name,
                    }))}
                    value={
                      companyId
                        ? {
                            value: Number(companyId),
                            label:
                              companies.find(
                                (c) => c.company_id === Number(companyId)
                              )?.company_name || "",
                          }
                        : null
                    }
                    onChange={(opt) =>
                      setCompanyId(opt ? String(opt.value) : "")
                    }
                    onCreateOption={async (inputValue) => {
                      try {
                        const res = await fetch(
                          `${import.meta.env.VITE_API_URL}/companies`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              company_name: inputValue,
                              company_description:
                                "Created automatically from job form",
                              company_location: "N/A",
                            }),
                          }
                        );

                        if (!res.ok)
                          throw new Error("Failed to create company");

                        const created = await res.json();
                        setCompanies((prev) => [created, ...prev]);
                        setCompanyId(String(created.company_id));
                      } catch (err) {
                        console.error("Error creating company:", err);
                        alert("Failed to create company. Please try again.");
                      }
                    }}
                    formatCreateLabel={(inputValue) =>
                      `Create "${inputValue}"`
                    }
                    placeholder="Select or type to create company..."
                    isClearable
                    isSearchable
                  />

                  <input
                    className="form-control"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <input
                    className="form-control"
                    placeholder="Salary (RWF)"
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                  <input
                    className="form-control"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Job Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </form>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
