import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../lib/types";

interface stateType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

const initialState: stateType = {
  user: null,
  isAuthenticated: false,
  isGuest: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setGuest: (state, action) => {
      state.isGuest = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setAuthenticated, setGuest } = userSlice.actions;
export default userSlice.reducer;
