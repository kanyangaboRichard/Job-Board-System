import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

interface User {
  id: number | string;
  email: string;
  role: "user" | "admin";
  name?: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

// Fetch all users
export const fetchUsers = createAsyncThunk("users/fetchAll", async () => {
  const res = await api.get<User[]>("/users");
  return res.data;
});

//  Make admin
export const makeAdmin = createAsyncThunk(
  "users/makeAdmin",
  async (id: number | string) => {
    const res = await api.patch<User>(`/users/${id}/make-admin`);
    return res.data;
  }
);

//  Revoke admin
export const revokeAdmin = createAsyncThunk(
  "users/revokeAdmin",
  async (id: number | string) => {
    const res = await api.patch<User>(`/users/${id}/revoke-admin`);
    return res.data;
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: number | string) => {
    await api.delete(`/users/${id}`);
    return id;
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(makeAdmin.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
      })
      .addCase(revokeAdmin.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;
