import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface User {
  id: number | string;
  email: string;
  role: "user" | "admin";
  name?: string;
}

const UserManagement: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6; // Users per page

  //  Build headers safely
  const getAuthHeaders = () => {
    const savedToken = token || localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: savedToken ? `Bearer ${savedToken}` : "",
    };
  };

  //  Fetch all users (Admin only)
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (!token && !localStorage.getItem("token")) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://job-board-system.onrender.com/api/users", {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(query) ||
        (u.name && u.name.toLowerCase().includes(query)) ||
        u.role.toLowerCase().includes(query)
    );
  }, [users, search]);

  //  Paginate filtered users
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  // When search changes, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 🛠 Promote a user to admin
  const handleMakeAdmin = async (id: number | string) => {
    try {
      const res = await fetch(`http://localhost:3005/api/users/${id}/make-admin`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error(`Failed to promote user: ${res.status}`);
      const updated = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // 🛠 Revoke admin rights (prevent self-revoke)
  const handleRevokeAdmin = async (id: number | string) => {
    if (String(user?.id) === String(id)) {
      alert("You cannot revoke your own admin privileges.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3005/api/users/${id}/revoke-admin`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error(`Failed to revoke admin: ${res.status}`);
      const updated = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  //  Access Control
  if (user?.role !== "admin") {
    return <p className="p-6 text-danger">Access denied — Admins only</p>;
  }

  if (loading) return <p className="p-6 text-muted">Loading users...</p>;
  if (error) return <p className="p-6 text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      {/* Fixed header under navbar */}
      <div
        className="bg-white py-3 px-3 mb-3 border-bottom shadow-sm position-sticky top-0"
        style={{ zIndex: 1030 }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 className="mb-0">Manage Users</h2>

          {/* Search bar */}
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 350 }}
            placeholder="Search by email, name, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {paginatedUsers.length === 0 ? (
        <p className="mt-3 text-muted">No users found.</p>
      ) : (
        <ul className="list-group mt-3">
          {paginatedUsers.map((u) => {
            const isCurrentAdmin = String(u.id) === String(user?.id);
            return (
              <li
                key={u.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  {u.email}{" "}
                  <small className="text-muted">
                    ({u.role}) {isCurrentAdmin && " — You"}
                  </small>
                </span>

                <div>
                  {u.role !== "admin" ? (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleMakeAdmin(u.id)}
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      className={`btn btn-sm ${
                        isCurrentAdmin
                          ? "btn-secondary disabled"
                          : "btn-outline-danger"
                      }`}
                      onClick={() => !isCurrentAdmin && handleRevokeAdmin(u.id)}
                      disabled={isCurrentAdmin}
                    >
                      {isCurrentAdmin ? "You" : "Revoke Admin"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination controls */}
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
    </div>
  );
};

export default UserManagement;
