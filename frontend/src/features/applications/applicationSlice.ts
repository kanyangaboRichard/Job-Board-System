import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

interface Application {
  id: number | string;
  jobTitle: string;
  status: "pending" | "accepted" | "rejected";
  responseNote?: string | null;
}

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  applications: [],
  loading: false,
  error: null,
};

// Get all applications (admin)
export const fetchApplications = createAsyncThunk<
  Application[], // return type
  void,          // arg type
  { rejectValue: string }
>("applications/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Application[]>("/applications");
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(error.response?.data?.message || "Failed to fetch applications");
  }
});

//  Get current user's applications
export const fetchUserApplications = createAsyncThunk<
  Application[],
  void,
  { rejectValue: string }
>("applications/fetchUser", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Application[]>("/applications/user");
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(error.response?.data?.message || "Failed to fetch user applications");
  }
});

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearApplications: (state) => {
      state.applications = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // all apps (admin)
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action: PayloadAction<Application[]>) => {
        state.applications = action.payload;
        state.loading = false;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch applications";
      })

      // user apps
      .addCase(fetchUserApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserApplications.fulfilled, (state, action: PayloadAction<Application[]>) => {
        state.applications = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user applications";
      });
  },
});

export const { clearApplications } = applicationSlice.actions;
export default applicationSlice.reducer;
