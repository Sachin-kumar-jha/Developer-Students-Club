import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const normalizeMedia = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.media)) return payload.media;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const fetchAllMedia = createAsyncThunk("media/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/media`);
    return normalizeMedia(res.data);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch media");
  }
});

export const fetchMediaByEventId = createAsyncThunk("media/fetchByEvent", async (eventId, thunkAPI) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/media/event/${eventId}`);
    return normalizeMedia(res.data);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch event media");
  }
});

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    allMedia: [],
    eventMedia: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All Media
      .addCase(fetchAllMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.allMedia = action.payload;
      })
      .addCase(fetchAllMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Event Media
      .addCase(fetchMediaByEventId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMediaByEventId.fulfilled, (state, action) => {
        state.loading = false;
        state.eventMedia = action.payload;
      })
      .addCase(fetchMediaByEventId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default mediaSlice.reducer;
