import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears token + user
    navigate("/"); // redirect to homepage
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container-fluid">
        {/* Brand / Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          Job Board
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                {/* Common for all authenticated users */}
                <li className="nav-item me-2">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>

                {/* Admin-only links */}
                {user.role === "admin" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin">
                        Admin Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/adminapplications">
                        Applications
                      </Link>
                    </li>
                  </>
                )}
                {/* Admin-only link */}
                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/users">
                      Manage Users
                    </Link>
                  </li>
                )}

                {/* Normal user-only link */}
                {user.role !== "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/applications">
                      My Applications
                    </Link>
                  </li>
                )}

                {/* Logout */}
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-light btn-sm ms-2"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* Public routes */}
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
