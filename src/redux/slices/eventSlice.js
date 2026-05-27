import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const normalizeEvents = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.events)) return payload.events;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

// Fetch all events
export const fetchEvents = createAsyncThunk("events/fetchEvents", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
    return normalizeEvents(res.data);
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: "Failed to fetch events" });
  }
});


export const registerForEvent = createAsyncThunk(
  "events/registerForEvent",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/registration/register/${id}`,
        {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to register for event"
      );
    }
  }
);

export const registerForPaidEvent = createAsyncThunk(
  "events/registerForPaidEvent",
  async ({ id, paymentScreenshot }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("paymentScreenshot", paymentScreenshot);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/registration/register-paid/${id}`,
        formData,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit paid registration"
      );
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    successMessage:null,
    loading: false,
    error: null,
  },
  reducers: {
     clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch events";
      })
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerForPaidEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerForPaidEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerForPaidEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });;
  },
});

export const { clearMessages } = eventSlice.actions;
export default eventSlice.reducer;
