import { describe, it, expect } from "vitest";
import userReducer, { setUser, setAuthenticated, setGuest } from "./userReducer";
import type { User } from "../../lib/types";

const initialState = {
  user: null,
  isAuthenticated: false,
  isGuest: false,
};

const sampleUser: User = {
  id: "1",
  name: "Alice",
  profilePicture: null,
  email: "alice@example.com",
  accessToken: "token",
  refreshToken: "refresh",
};

describe("userReducer", () => {
  it("returns the initial state by default", () => {
    expect(userReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("setUser stores the given user object", () => {
    const state = userReducer(initialState, setUser(sampleUser));
    expect(state.user).toEqual(sampleUser);
  });

  it("setAuthenticated toggles isAuthenticated", () => {
    const state = userReducer(initialState, setAuthenticated(true));
    expect(state.isAuthenticated).toBe(true);
  });

  it("setGuest toggles isGuest", () => {
    const state = userReducer(initialState, setGuest(true));
    expect(state.isGuest).toBe(true);
  });

  // NOTE: `logout` is defined as a reducer in the slice but is not included in
  // `userSlice.actions` destructuring/export, so app code can never import or
  // dispatch it (grep confirms no `dispatch(logout())` anywhere). The reducer
  // logic itself is exercised here via the raw action type; the missing export
  // means real logout flows never actually clear `user`/`isAuthenticated` in
  // the store.
  it("logout (dispatched by raw action type, since it isn't exported) clears user/isAuthenticated but leaves isGuest untouched", () => {
    const loggedInState = {
      user: sampleUser,
      isAuthenticated: true,
      isGuest: true,
    };

    const state = userReducer(loggedInState, { type: "user/logout" });

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isGuest).toBe(true);
  });
});
