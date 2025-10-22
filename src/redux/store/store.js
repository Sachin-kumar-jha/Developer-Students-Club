import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice.js";
import eventReducer from "../slices/eventSlice.js";
import mediaReducer from "../slices/mediaSlice.js";
const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    media: mediaReducer,
  },
});

export default store;
