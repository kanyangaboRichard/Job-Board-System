import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import axios from "axios";

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

  // Fetch Jobs
  useEffect(() => {
    if (!token) return;

    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:3005/api/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  // Fetch Stats
  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const res = await axios.get<Stats>("http://localhost:3005/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [token]);

  // Save (Add or Edit)
  const handleSave = async () => {
    const salaryNum = Number(salary) || 0;

    if (!title || !company || !location || !description || !deadline) {
      setError("Please fill in all fields, including deadline.");
      return;
    }

    try {
      const method = editingJob ? "PUT" : "POST";
      const url = editingJob
        ? `http://localhost:3005/api/jobs/${editingJob.id}`
        : "http://localhost:3005/api/jobs";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          company,
          location,
          description,
          salary: salaryNum,
          deadline,
        }),
      });

      if (!res.ok) throw new Error("Failed to save job");

      const savedJob = await res.json();

      if (editingJob) {
        setJobs((prev) => prev.map((job) => (job.id === savedJob.id ? savedJob : job)));
      } else {
        setJobs((prev) => [savedJob, ...prev]);
      }

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

  if (!token) return <p className="p-4 text-muted">Please log in as an admin.</p>;
  if (user?.role !== "admin")
    return <p className="p-4 text-danger">Access denied.</p>;
  if (loading) return <p className="p-4 text-muted">Loading jobs...</p>;

  return (
    <div className="container-fluid mt-3">
      {/*Sticky Header Stack */}
      <div
        className="bg-white shadow-sm py-3 px-3 rounded-3 sticky-top"
        style={{ top: "56px", zIndex: 1030 }}
      >
        <h2 className="fw-bold text-primary mb-1">Admin Dashboard</h2>
        <p className="text-muted mb-2">
          Welcome, {user?.name || "Admin"}! Manage all job postings below.
        </p>

        <button
          className="btn btn-sm btn-primary mb-3"
          onClick={() => setShowModal(true)}
        >
          + Add Job
        </button>

        {error && (
          <div className="alert alert-danger py-1 small mb-2" role="alert">
            {error}
          </div>
        )}

        {stats && (
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-2 ">
            {Object.entries(stats).map(([key, value]) => (
              <div
                key={key}
                className="card text-center border-0 shadow-sm"
                style={{
                  width: "130px",
                  backgroundColor: "#f7eac2ff",
                  borderRadius: "10px",
                }}
              >
                <div className="card-body p-2">
                  <h6 className="text-capitalize text-muted mb-1">{key}</h6>
                  <p className="fw-bold text-info fs-6 mb-0">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/*   Job List */}
      <div className="mt-4 row">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="col-md-6 col-lg-4 mb-4 colorh-100">
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
                  <p className="fw-semibold mt-2">Salary: {job.salary} RWF</p>

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
            <p className="text-muted">No job postings available.</p>
          </div>
        )}
      </div>

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
                    placeholder="Salary"
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
