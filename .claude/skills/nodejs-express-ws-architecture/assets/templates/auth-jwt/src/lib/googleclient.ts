import { OAuth2Client } from "google-auth-library";

// Only needed if the new app uses Google OAuth sign-in, like server1/ does.
// Delete this file if auth is JWT-only with your own credential flow.
export const client = new OAuth2Client();
