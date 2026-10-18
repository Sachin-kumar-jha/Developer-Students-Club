import axios from "axios";
import { toast } from "react-toastify";
import store from "../redux/store/store.js";

/**
 * Global Axios interceptor to handle 401 (token expired/invalid) responses.
 * Auto-clears user session and prompts re-login instead of showing cryptic errors.
 */

let isLoggingOut = false; // Prevent multiple toasts firing at once

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      // Clear user from localStorage
      localStorage.removeItem("user");

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
