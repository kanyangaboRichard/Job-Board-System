// src/api/userAPI.ts
import api from "./apiClient";

export type User = {
  id: number | string;
  email: string;
  role: "user" | "admin";
  name?: string;
};

/**
 * Helper to ensure Authorization header is always included
 */
const withAuth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/**
 * Fetch all users (admin only)
 */
export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>("/users", withAuth());
  return res.data;
};

/**
 *  Promote user to admin
 */
export const promoteUser = async (id: number | string): Promise<User> => {
  const res = await api.patch<User>(`/users/${id}/make-admin`, null, withAuth());
  return res.data;
};

/**
 *  Revoke admin rights
 */
export const revokeUserAdmin = async (id: number | string): Promise<User> => {
  const res = await api.patch<User>(`/users/${id}/revoke-admin`, null, withAuth());
  return res.data;
};

/**
 * Delete user (optional)
 */
export const deleteUser = async (
  id: number | string
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`/users/${id}`, withAuth());
  return res.data;
};
