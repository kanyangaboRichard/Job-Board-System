import React, { useEffect, useState } from "react";
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

  // ✅ Build headers safely
  const getAuthHeaders = () => {
    const savedToken = token || localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: savedToken ? `Bearer ${savedToken}` : "",
    };
  };

  // ✅ Fetch all users (Admin only)
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (!token && !localStorage.getItem("token")) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3005/api/users", {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, token]);

  // ✅ Promote a user to admin
  const handleMakeAdmin = async (id: number | string) => {
    try {
      const res = await fetch(`http://localhost:3005/api/users/${id}/make-admin`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to promote user: ${res.status}`);
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // ✅ Revoke admin rights (prevent self-revoke)
  const handleRevokeAdmin = async (id: number | string) => {
    if (String(user?.id) === String(id)) {
      alert("⚠️ You cannot revoke your own admin privileges.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3005/api/users/${id}/revoke-admin`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to revoke admin: ${res.status}`);
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // ✅ Access Control
  if (user?.role !== "admin") {
    return <p className="p-6 text-danger">Access denied — Admins only</p>;
  }

  if (loading) {
    return <p className="p-6 text-muted">Loading users...</p>;
  }

  if (error) {
    return <p className="p-6 text-danger">{error}</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Manage Users</h2>

      {users.length === 0 ? (
        <p className="mt-3 text-muted">No users found.</p>
      ) : (
        <ul className="list-group mt-3">
          {users.map((u) => {
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
                        isCurrentAdmin ? "btn-secondary disabled" : "btn-outline-danger"
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
    </div>
  );
};

export default UserManagement;
