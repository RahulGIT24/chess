// The shared vocabulary between client and server for WebSocket message `type` discriminants.
// Add new message types here first — never inline a string literal type in two places.

export const CONNECT = "connect";
export const INIT_SESSION = "init_session";
export const UPDATE = "update";
export const END_SESSION = "end_session";
export const ERROR = "error";
export const PEER_DISCONNECT = "peer-disconnected";
export const RECONNECTING = "reconnecting";
export const RECONNECTED = "reconnected";
