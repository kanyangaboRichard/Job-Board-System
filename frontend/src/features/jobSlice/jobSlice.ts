import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: number;
}

interface JobState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  loading: false,
  error: null,
};

// ✅ Fetch jobs
export const fetchJobs = createAsyncThunk<Job[]>(
  "jobs/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Job[]>("/jobs");
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to fetch jobs");
    }
  }
);

// ✅ Add job
export const addJob = createAsyncThunk<Job, Omit<Job, "id">>(
  "jobs/add",
  async (job, { rejectWithValue }) => {
    try {
      const res = await api.post<Job>("/jobs", job);
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to add job");
    }
  }
);

// ✅ Update job
export const updateJob = createAsyncThunk<Job, Job>(
  "jobs/update",
  async (job, { rejectWithValue }) => {
    try {
      const res = await api.put<Job>(`/jobs/${job.id}`, job);
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to update job");
    }
  }
);

// ✅ Delete job
export const deleteJob = createAsyncThunk<number, number>(
  "jobs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to delete job");
    }
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.jobs = action.payload;
        state.loading = false;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // add job
      .addCase(addJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.jobs.push(action.payload);
      })

      // update job
      .addCase(updateJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.jobs = state.jobs.map((j) =>
          j.id === action.payload.id ? action.payload : j
        );
      })

      // delete job
      .addCase(deleteJob.fulfilled, (state, action: PayloadAction<number>) => {
        state.jobs = state.jobs.filter((j) => j.id !== action.payload);
      });
  },
});

export default jobSlice.reducer;
