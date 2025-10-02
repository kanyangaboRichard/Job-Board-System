import api from "./apiClient";

export type User = {
  id: number | string;
  email: string;
  role: "user" | "admin";
  name?: string;
};

// Promote a user to admin
export const makeAdmin = async (userId: number | string): Promise<User> => {
  const res = await api.patch<User>(`/users/${userId}/make-admin`);
  return res.data;
};

// Get all users (for admin dashboard)
export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>("/users");
  return res.data;
};
