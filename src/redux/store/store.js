import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice.js";
import eventReducer from "../slices/eventSlice.js";
import mediaReducer from "../slices/mediaSlice.js";
import registrationReducer from "../slices/registrationSlice.js";
const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    media: mediaReducer,
    registrations:registrationReducer
  },
});

export default store;
