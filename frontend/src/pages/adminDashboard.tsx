import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import axios from "axios";
import Select from "react-select";

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
  company: string;
  salary: number;
  deadline?: string;
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
  value: string;
  label: string;
}

const AdminDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Search & Pagination
  const [selectedCompany, setSelectedCompany] = useState<Option | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  //  Fetch Jobs
  useEffect(() => {
    if (!token) return;
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:3005/api/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data: Job[] = await res.json();

        // Ensure salary is numeric for display
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

  //  Fetch Stats
  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const res = await axios.get<Stats>(
          "http://localhost:3005/api/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [token]);

  // Company filter options
  const companyOptions: Option[] = useMemo(() => {
    const uniqueCompanies = Array.from(new Set(jobs.map((j) => j.company)));
    return uniqueCompanies.map((comp) => ({ value: comp, label: comp }));
  }, [jobs]);

  // Filter jobs by company
  const filteredJobs = useMemo(() => {
    if (!selectedCompany) return jobs;
    return jobs.filter((job) => job.company === selectedCompany.value);
  }, [jobs, selectedCompany]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + jobsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompany]);

  // Save (Add/Edit Job)
  const handleSave = async () => {
    const salaryNum = Number(salary);

    if (
      !title.trim() ||
      !company.trim() ||
      !location.trim() ||
      !description.trim() ||
      !deadline.trim()
    ) {
      setError("Please fill in all fields, including deadline.");
      return;
    }

    if (isNaN(salaryNum) || salaryNum <= 0) {
      setError("Please enter a valid salary greater than 0.");
      return;
    }

    try {
      const method = editingJob ? "PUT" : "POST";
      const url = editingJob
        ? `http://localhost:3005/api/jobs/${editingJob.id}`
        : "http://localhost:3005/api/jobs";

      const body = JSON.stringify({
        title,
        company,
        location,
        description,
        salary: salaryNum,
        deadline,
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
      const res = await fetch(`http://localhost:3005/api/jobs/${id}`, {
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

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setSalary("");
    setDescription("");
    setDeadline("");
    setEditingJob(null);
    setShowModal(false);
    setError(null);
  };

  // Render
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

        {/* React-select company filter */}
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

      {/* Stats */}
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
                    {job.company} — {job.location}
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
                        setCompany(job.company);
                        setLocation(job.location);
                        setSalary(String(job.salary));
                        setDescription(job.description);
                        setDeadline(job.deadline || "");
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

      {/* Modal */}
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
                  <input
                    className="form-control"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
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
