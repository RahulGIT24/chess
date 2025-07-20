import { WebSocket } from "ws";

export interface Move {
  from: string;
  to: string;
}

export interface IApiResponse<T> {
  statuscode: number;
  data: T;
  message: string;
}

export interface DecodedToken {
  user_id: string;
}

export interface IPending {
  socket: WebSocket;
  name: string;
  timeLeft: number;
  id: string;
  profilePicture?: string | null
}

export interface Pending extends IPending {
  color: "white" | "black";
  rating: number
}

export interface SaveInitGame {
  id: string;
  pgn: string
  whiteId: string;
  blackId: string;
  duration: number;
  whiteTimeLeft: number;
  blackTimeLeft: number;
}

export interface Player {
  socket: WebSocket | null;
  id: string;
  timeLeft: number;
  name: string | null;
  color: "black" | "white";
  profilePicture?: string | null
  rating: number
}

export interface MoveReview {
  gameReviewId: string,
  move: number,
  color: string,
  bestMove: string | null,
  evalBefore: number | null,
  san: string,
  evalAfter: number | null
  centipawnLoss: number | null
  moveAccuracy: string | null,
  label: string | null,
}