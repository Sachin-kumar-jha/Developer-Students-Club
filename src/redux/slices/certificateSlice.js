import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fetch student's own certificates
export const fetchMyCertificates = createAsyncThunk(
  "certificates/fetchMyCertificates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/certificates/my`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch certificates");
    }
  }
);

// Fetch all certificates for an event (Admin)
export const fetchEventCertificates = createAsyncThunk(
  "certificates/fetchEventCertificates",
  async ({ eventId, search = "", status = "" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/certificates/event/${eventId}`, {
        params: { search, status },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch event certificates");
    }
  }
);

// Bulk generate certificates (Admin)
export const generateBulkCertificates = createAsyncThunk(
  "certificates/generateBulkCertificates",
  async ({ eventId, target = "attended", userIds = [], certificateType = "participation", issueDate }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/certificates/generate-bulk`,
        { eventId, target, userIds, certificateType, issueDate },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to generate certificates");
    }
  }
);

// Issue single certificate (Admin)
export const issueSingleCertificate = createAsyncThunk(
  "certificates/issueSingleCertificate",
  async (certData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/certificates/issue-single`, certData, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to issue certificate");
    }
  }
);

// Upload custom certificate background template (Admin)
export const uploadCertificateTemplate = createAsyncThunk(
  "certificates/uploadCertificateTemplate",
  async ({ eventId, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/certificates/template/${eventId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to upload certificate template");
    }
  }
);

// Public verification (No auth)
export const verifyCertificate = createAsyncThunk(
  "certificates/verifyCertificate",
  async (certificateId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/certificates/verify/${certificateId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { valid: false, message: "Certificate not found" });
    }
  }
);

// Update status (Admin)
export const updateCertificateStatus = createAsyncThunk(
  "certificates/updateCertificateStatus",
  async ({ certificateId, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/certificates/${certificateId}/status`,
        { status },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update certificate status");
    }
  }
);

// Delete certificate (Admin)
export const deleteCertificate = createAsyncThunk(
  "certificates/deleteCertificate",
  async (certificateId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/certificates/${certificateId}`, {
        withCredentials: true,
      });
      return { certificateId, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete certificate");
    }
  }
);

// Fetch event candidate students (all registered / attendees for individual issue)
export const fetchEventCandidates = createAsyncThunk(
  "certificates/fetchEventCandidates",
  async ({ eventId, search = "" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/certificates/candidates/${eventId}`, {
        params: { search },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch event candidates");
    }
  }
);

const certificateSlice = createSlice({
  name: "certificates",
  initialState: {
    myCertificates: [],
    eventCertificates: [],
    candidates: [],
    eventData: null,
    stats: null,
    verifiedCertificate: null,
    loading: false,
    loadingCandidates: false,
    verifying: false,
    generating: false,
    uploadingTemplate: false,
    error: null,
  },
  reducers: {
    clearVerification: (state) => {
      state.verifiedCertificate = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my certificates
      .addCase(fetchMyCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.myCertificates = action.payload.certificates || [];
      })
      .addCase(fetchMyCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch event certificates
      .addCase(fetchEventCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.eventCertificates = action.payload.certificates || [];
        state.eventData = action.payload.event || null;
        state.stats = action.payload.stats || null;
      })
      .addCase(fetchEventCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk generate
      .addCase(generateBulkCertificates.pending, (state) => {
        state.generating = true;
      })
      .addCase(generateBulkCertificates.fulfilled, (state) => {
        state.generating = false;
      })
      .addCase(generateBulkCertificates.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })

      // Upload template
      .addCase(uploadCertificateTemplate.pending, (state) => {
        state.uploadingTemplate = true;
      })
      .addCase(uploadCertificateTemplate.fulfilled, (state, action) => {
        state.uploadingTemplate = false;
        if (state.eventData) {
          state.eventData.certificateTemplate = action.payload.certificateTemplate;
        }
      })
      .addCase(uploadCertificateTemplate.rejected, (state, action) => {
        state.uploadingTemplate = false;
        state.error = action.payload;
      })

      // Verify certificate
      .addCase(verifyCertificate.pending, (state) => {
        state.verifying = true;
        state.verifiedCertificate = null;
        state.error = null;
      })
      .addCase(verifyCertificate.fulfilled, (state, action) => {
        state.verifying = false;
        state.verifiedCertificate = action.payload;
      })
      .addCase(verifyCertificate.rejected, (state, action) => {
        state.verifying = false;
        state.verifiedCertificate = action.payload;
        state.error = action.payload?.message || "Verification failed";
      })

      // Delete certificate
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.eventCertificates = state.eventCertificates.filter(
          (c) => c.certificateId !== action.payload.certificateId
        );
      })

      // Fetch event candidates
      .addCase(fetchEventCandidates.pending, (state) => {
        state.loadingCandidates = true;
      })
      .addCase(fetchEventCandidates.fulfilled, (state, action) => {
        state.loadingCandidates = false;
        state.candidates = action.payload.candidates || [];
      })
      .addCase(fetchEventCandidates.rejected, (state, action) => {
        state.loadingCandidates = false;
        state.error = action.payload;
      });
  },
});

export const { clearVerification } = certificateSlice.actions;
export default certificateSlice.reducer;
