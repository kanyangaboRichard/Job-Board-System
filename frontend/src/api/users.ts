// src/api/userAPI.ts
import api from "./apiClient";

export type User = {
  id: number | string;
  email: string;
  role: "user" | "admin";
  name?: string;
};

//  Fetch all users (admin only)
export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>("/users");
  return res.data;
};

//  Promote user to admin
export const promoteUser = async (id: number | string): Promise<User> => {
  const res = await api.patch<User>(`/users/${id}/make-admin`);
  return res.data;
};

//  Revoke admin rights
export const revokeUserAdmin = async (id: number | string): Promise<User> => {
  const res = await api.patch<User>(`/users/${id}/revoke-admin`);
  return res.data;
};

// Delete user (optional)
export const deleteUser = async (id: number | string): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`/users/${id}`);
  return res.data;
};
