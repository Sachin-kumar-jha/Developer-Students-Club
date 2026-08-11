import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/attendance`;

/**
 * Mark attendance via QR scan (admin only)
 */
export const markAttendance = createAsyncThunk(
  "attendance/mark",
  async ({ userId, type, eventId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/mark`,
        { userId, type, eventId },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark attendance");
    }
  }
);

/**
 * Fetch attendance records (admin only, with filters)
 */
export const fetchAttendance = createAsyncThunk(
  "attendance/fetch",
  async ({ type = "all", date, eventId } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (type) params.append("type", type);
      if (date) params.append("date", date);
      if (eventId) params.append("eventId", eventId);

      const res = await axios.get(`${API_URL}?${params.toString()}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch attendance");
    }
  }
);

/**
 * Fetch logged-in user's own attendance
 */
export const fetchMyAttendance = createAsyncThunk(
  "attendance/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/my`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch your attendance");
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    // Admin state
    memberRecords: [],
    ordinaryRecords: [],
    totalMembers: 0,
    totalOrdinary: 0,
    total: 0,

    // User state
    myRecords: [],
    myTotal: 0,
    myUserType: null,

    // Scan result
    lastScanResult: null,

    loading: false,
    error: null,
  },
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    clearLastScanResult: (state) => {
      state.lastScanResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.lastScanResult = action.payload;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch attendance (admin)
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.memberRecords = action.payload.memberRecords;
        state.ordinaryRecords = action.payload.ordinaryRecords;
        state.totalMembers = action.payload.totalMembers;
        state.totalOrdinary = action.payload.totalOrdinary;
        state.total = action.payload.total;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch my attendance
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.myRecords = action.payload.records;
        state.myTotal = action.payload.total;
        state.myUserType = action.payload.userType;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceError, clearLastScanResult } = attendanceSlice.actions;
export default attendanceSlice.reducer;
