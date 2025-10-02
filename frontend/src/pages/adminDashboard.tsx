import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
  company: string;
  salary: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  // Add job state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [salary, setSalary] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  // Edit & Delete state
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      const res = await fetch("http://localhost:3005/api/jobs");
      const data = await res.json();
      setJobs(data);
    };
    fetchJobs();
  }, []);

  // Add job handler
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated!");

    const res = await fetch("http://localhost:3005/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        location,
        description,
        company,
        salary: Number(salary),
      }),
    });

    if (res.ok) {
      const newJob = await res.json();
      setJobs((prev) => [...prev, newJob]);
      setTitle("");
      setLocation("");
      setDescription("");
      setCompany("");
      setSalary("");
      setShowAddModal(false); // close modal after adding
    } else {
      const error = await res.json();
      alert(error.error || "Failed to add job");
    }
  };

  // Update job handler
  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated!");

    const res = await fetch(`http://localhost:3005/api/jobs/${editingJob.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editingJob),
    });

    if (res.ok) {
      const updated = await res.json();
      setJobs((prev) =>
        prev.map((job) => (job.id === updated.id ? updated : job))
      );
      setEditingJob(null);
    } else {
      const error = await res.json();
      alert(error.error || "Failed to update job");
    }
  };

  // Delete job handler
  const handleDeleteJob = async () => {
    if (!deletingJob) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated!");

    const res = await fetch(
      `http://localhost:3005/api/jobs/${deletingJob.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      setJobs((prev) => prev.filter((job) => job.id !== deletingJob.id));
      setDeletingJob(null);
    } else {
      const error = await res.json();
      alert(error.error || "Failed to delete job");
    }
  };

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <p>
        Welcome, <strong>{user?.role}</strong>
      </p>

      {/* Button to open Add Job Modal */}
      <button
        className="btn btn-primary mt-3"
        onClick={() => setShowAddModal(true)}
      >
        Add New Job
      </button>

      {/* Job list in cards */}
      <div className="row mt-4">
        {currentJobs.map((job) => (
          <div key={job.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{job.title}</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  {job.company} - {job.location}
                </h6>
                <p className="card-text text-truncate">{job.description}</p>
                <p className="fw-bold mt-auto"> {job.salary}Rwf</p>

                <div className="mt-2">
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => setEditingJob(job)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setDeletingJob(job)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleAddJob}>
                <div className="modal-header">
                  <h5 className="modal-title">Add New Job</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    placeholder="Job Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                  <textarea
                    className="form-control mb-2"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    type="number"
                    placeholder="Salary"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingJob && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleUpdateJob}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Job</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingJob(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    value={editingJob.title}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, title: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    value={editingJob.location}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, location: e.target.value })
                    }
                  />
                  <textarea
                    className="form-control mb-2"
                    value={editingJob.description}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        description: e.target.value,
                      })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    value={editingJob.company}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, company: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    type="number"
                    value={editingJob.salary}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        salary: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingJob(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingJob && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeletingJob(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deletingJob.title}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeletingJob(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteJob}>
                  Delete
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
