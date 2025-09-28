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

  // Add form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [salary, setSalary] = useState("");

  // Edit state
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Delete state
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

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
      setJobs((prev) => prev.map((job) => (job.id === updated.id ? updated : job)));
      setEditingJob(null); // close modal
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

    const res = await fetch(`http://localhost:3005/api/jobs/${deletingJob.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setJobs((prev) => prev.filter((job) => job.id !== deletingJob.id));
      setDeletingJob(null); // close modal
    } else {
      const error = await res.json();
      alert(error.error || "Failed to delete job");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <p>Welcome, <strong>{user?.role}</strong></p>

      {/* Add Job Form */}
      <div className="card p-3 mt-3 shadow-sm">
        <h5>Add New Job</h5>
        <form onSubmit={handleAddJob}>
          <input className="form-control mb-2" placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className="form-control mb-2" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <input className="form-control mb-2" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
          <input className="form-control mb-2" type="number" placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} required />
          <button type="submit" className="btn btn-primary w-100">Add Job</button>
        </form>
      </div>

      {/* Job list */}
      <div className="list-group mt-4">
        {jobs.map((job) => (
          <div key={job.id} className="list-group-item">
            <h5>{job.title}</h5>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Salary:</strong> ${job.salary}</p>
            <small>{job.description}</small>
            <div className="mt-2">
              <button className="btn btn-sm btn-warning me-2" onClick={() => setEditingJob(job)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => setDeletingJob(job)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleUpdateJob}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Job</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingJob(null)}></button>
                </div>
                <div className="modal-body">
                  <input className="form-control mb-2" value={editingJob.title} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} />
                  <input className="form-control mb-2" value={editingJob.location} onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })} />
                  <textarea className="form-control mb-2" value={editingJob.description} onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })} />
                  <input className="form-control mb-2" value={editingJob.company} onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })} />
                  <input className="form-control mb-2" type="number" value={editingJob.salary} onChange={(e) => setEditingJob({ ...editingJob, salary: Number(e.target.value) })} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingJob(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
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
                <button type="button" className="btn-close" onClick={() => setDeletingJob(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{deletingJob.title}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeletingJob(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteJob}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
