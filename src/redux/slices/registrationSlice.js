import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_URL = "http://localhost:5000/api/registration";         
// Thunk to fetch registrations
export const fetchRegistrations = createAsyncThunk(
  "registrations/fetch",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      let url;
      if (role === "admin") {
        url = `${API_URL}`;
        console.log("Admin start");
      } else {
        url = `${API_URL}/${userId}`;
      }

      const res = await axios.get(url, { withCredentials: true });
      console.log(res.data.registrations); 

      return res.data.registrations;          // return array of registrations
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch registrations");
    }
  }
);

const registrationSlice = createSlice({
  name: "registrations",
  initialState: {
    registrations: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearRegistrationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.registrations = action.payload;
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRegistrationError } = registrationSlice.actions;
export default registrationSlice.reducer;
