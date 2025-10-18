import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice.js";
import eventReducer from "../slices/eventSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
  },
});

export default store;
