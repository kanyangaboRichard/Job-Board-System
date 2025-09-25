import {jwtDecode} from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
}

interface DecodedToken {
  id: number;
  role: string;
  name?: string; // 
  exp: number;
}

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:3005/api/jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };

    //  checking ze token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.name) {
          setUsername(decoded.name);
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }

    fetchJobs();
  }, []);

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold"> Available Jobs</h2>
        <p className="text-muted">
          Welcome, {username}! Browse the latest job postings below.
        </p>
        <img
          src="assets/banner.jpeg"
          className="img-fluid rounded mb-3"
          alt="Career opportunities banner"
          loading="lazy"
        />
        <p className="text-muted">
          This is where you can find exciting opportunities to advance your
          career. Explore the latest job postings and take the next step
          towards your dream job. Jobs are updated regularly, so check back
          often!
        </p>

        <div className="d-flex justify-content-center align-items-center gap-3 mt-3 mb-4">
          <img
            src="/assets/Tech.jpeg"
            className="img-thumbnail"
            alt="Tech jobs"
            style={{ maxWidth: 150 }}
            loading="lazy"
            title="Tech"
          />
          <img
            src="assets/design.jpeg"
            className="img-thumbnail"
            alt="Design jobs"
            style={{ maxWidth: 150 }}
            loading="lazy"
            title="Design"
          />
          <img
            src="assets/markets.jpeg"
            className="img-thumbnail"
            alt="Marketing jobs"
            style={{ maxWidth: 150 }}
            loading="lazy"
            title="Marketing"
          />
        </div>

        {/* Expanded categories gallery */}
        <div className="row g-2 mb-3" aria-label="Job categories gallery">
          <div className="col-6 col-md-4 col-lg-2 mb-2">
            <img
              src="assets/customSuport.jpeg"
              className="img-fluid rounded w-100"
              alt="Sales jobs"
              style={{ maxHeight: 120, objectFit: "cover" }}
              loading="lazy"
              title="Sales"
            />
            <p className="small text-center mt-1 mb-0">Sales</p>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-2">
            <img
              src="assets/Finance.jpeg"
              className="img-fluid rounded w-100"
              alt="Finance jobs"
              style={{ maxHeight: 120, objectFit: "cover" }}
              loading="lazy"
              title="Finance"
            />
            <p className="small text-center mt-1 mb-0">Finance</p>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-2">
            <img
              src="assets/HR.jpeg"
              className="img-fluid rounded w-100"
              alt="Human resources jobs"
              style={{ maxHeight: 120, objectFit: "cover" }}
              loading="lazy"
              title="Human Resources"
            />
            <p className="small text-center mt-1 mb-0">Human Resources</p>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-2">
            <img
              src="assets/product.jpeg"
              className="img-fluid rounded w-100"
              alt="Product jobs"
              style={{ maxHeight: 120, objectFit: "cover" }}
              loading="lazy"
              title="Product"
            />
            <p className="small text-center mt-1 mb-0">Product</p>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-2">
            <img
              src="assets/CS.jpeg"
              className="img-fluid rounded w-100"
              alt="Customer support jobs"
              style={{ maxHeight: 120, objectFit: "cover" }}
              loading="lazy"
              title="Customer Support"
            />
            <p className="small text-center mt-1 mb-0">Customer Support</p>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-2">
            <img
              src="assets/operations.jpeg"
              className="img-fluid rounded w-100"
              alt="Operations jobs"
              style={{ maxHeight: 120, objectFit: "cover" }}
              loading="lazy"
              title="Operations"
            />
            <p className="small text-center mt-1 mb-0">Operations</p>
          </div>
        </div>

        <div className="text-center mb-4">
          <Link to="/jobs" className="btn btn-outline-primary btn-sm" aria-label="See all job categories">
            See all categories
          </Link>
        </div>
      </div>

      {/* Job list */}
      <div className="row">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{job.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {job.location}
                  </h6>
                  <p className="card-text text-truncate">{job.description}</p>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn btn-primary mt-auto"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">No jobs available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
