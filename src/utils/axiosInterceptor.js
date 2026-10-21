import axios from "axios";
import { toast } from "react-toastify";
import store from "../redux/store/store.js";

/**
 * Global Axios interceptor to:
 * 1. Attach Bearer token to all outgoing requests if present in localStorage.
 * 2. Handle 401 (token expired/invalid) responses and prompt re-login.
 */

let isLoggingOut = false; // Prevent multiple toasts firing at once

// Request interceptor to automatically attach JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      // Clear user and token from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Reset Redux auth state
      store.dispatch({ type: "auth/logoutUser/fulfilled" });

      // Show appropriate message based on errorCode
      if (errorCode === "TOKEN_EXPIRED") {
        toast.warning("Session expired. Please login again.", { toastId: "session-expired" });
      } else if (errorCode === "TOKEN_INVALID") {
        toast.error("Session invalid. Please login again.", { toastId: "session-invalid" });
      } else {
        toast.error("Please login to continue.", { toastId: "auth-required" });
      }

      // Reset flag after a short delay to allow new toasts if needed
      setTimeout(() => {
        isLoggingOut = false;
      }, 3000);
    }

    return Promise.reject(error);
  }
);

export default axios;
