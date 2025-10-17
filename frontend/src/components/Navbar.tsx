import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import type { RootState } from "../store/store";

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-info sticky-top shadow-sm">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/">
          <span className="text-white">Job</span>
          <span className="text-warning"> Board</span>
        </Link>

        {/* Toggle button for mobile */}
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

        {/* Navbar links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {user ? (
              <>
                {/* Common link */}
                <li className="nav-item me-2">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "fw-bold text-white" : ""}`
                    }
                  >
                    Home
                  </NavLink>
                </li>

                {/* Admin links */}
                {user.role === "admin" && (
                  <>
                    <li className="nav-item">
                      <NavLink
                        to="/admin"
                        end //ensures it’s only active on /admin
                        className={({ isActive }) =>
                          `nav-link ${isActive ? "fw-bold text-white" : ""}`
                        }
                      >
                        Dashboard
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/admin/applications"
                        className={({ isActive }) =>
                          `nav-link ${isActive ? "fw-bold text-white" : ""}`
                        }
                      >
                        Applications
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                          `nav-link ${isActive ? "fw-bold text-white" : ""}`
                        }
                      >
                        Manage Users
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/admin/report"
                        className={({ isActive }) =>
                          `nav-link ${isActive ? "fw-bold text-white" : ""}`
                        }
                      >
                        Reports
                      </NavLink>
                    </li>
                  </>
                )}

                {/* User-only links */}
                {user.role === "user" && (
                  <li className="nav-item">
                    <NavLink
                      to="/applications"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "fw-bold text-white" : ""}`
                      }
                    >
                      My Applications
                    </NavLink>
                  </li>
                )}

                {/* Logout */}
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light btn-sm ms-2"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Not logged in
              <>
                <li className="nav-item">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "fw-bold text-white" : ""}`
                    }
                  >
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "fw-bold text-white" : ""}`
                    }
                  >
                    Register
                  </NavLink>
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
