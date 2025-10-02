import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

interface User {
  id: number | string;
  email: string;
  role: "user" | "admin";
  name?: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper: get token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch users (admin only)
  useEffect(() => {
    if (user?.role === "admin") {
      fetch("http://localhost:3005/api/users", {
        method: "GET",
        headers: getAuthHeaders(),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
          return res.json();
        })
        .then(setUsers)
        .catch((err) => setError(err.message));
    }
  }, [user]);

  // Promote user to admin
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

  // Revoke admin privileges
  const handleRevokeAdmin = async (id: number | string) => {
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

  if (user?.role !== "admin") {
    return <p className="p-6 text-red-600">Access denied</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Manage Users</h2>
      <ul className="list-group mt-3">
        {users.map((u) => (
          <li
            key={u.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {u.email} ({u.role})
            </span>

            {/* Show buttons depending on role */}
            {u.role === "user" ? (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleMakeAdmin(u.id)}
              >
                Make Admin
              </button>
            ) : (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleRevokeAdmin(u.id)}
                disabled={u.id === user.id} // prevent self-revoke
              >
                Revoke Admin
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
