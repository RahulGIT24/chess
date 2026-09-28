import jwt from "jsonwebtoken";

interface TokenPayload {
  user_id: string;
  email?: string;
}

// Centralize token creation here so access/refresh expiry and payload shape have one source
// of truth instead of being duplicated in every auth-related controller.
export const generateAccessAndRefreshTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "2h" });
  const refreshToken = jwt.sign(
    { user_id: payload.user_id },
    process.env.JWT_SECRET_REFRESH!,
    { expiresIn: "12h" }
  );
  return { accessToken, refreshToken };
};

export interface DecodedToken {
  user_id: string;
}
