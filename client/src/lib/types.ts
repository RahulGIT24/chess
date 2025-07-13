import { Color, PieceSymbol, Square } from "chess.js";

export type ChessBoardProps = {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  setBoard: any;
  chess: any;
  myColor: string;
  gamelocked: boolean;
};

export interface UserMoves {
  piece: string;
  place: string;
}

export interface ButtonArr {
  text: string;
  func: any;
  className?: string;
}

export type ConfimationProps = {
  text: string;
  buttons: ButtonArr[];
};

export type MoveHistoryComponent = {
  setWaiting: (arg: boolean) => void;
  socket: WebSocket;
  gameStarted: boolean;
  moveHistory: any;
  offerDraw: () => void;
  onResign: () => void;
  waiting: boolean;
};

export type apiCallParams = {
  url: string;
  data?: any;
  method: string;
};

export type WinnerProps = {
  winner?: string;
  closeModal: () => void;
  myColor: string;
  // name: string,
  opponentName: string;
  resignedColor?: string;
  timeUpColor?: string;
};

export type PromotionProps = {
  myColor: string;
  handlePromotion: (piece: PieceSymbol) => void;
};
export interface ResignModal {
  resignModal: boolean;
  onResignConfirm: () => void;
  closeResignModal: () => void;
}

export interface ButtonI {
  onClick: () => void;
  children: React.ReactNode;
  classname?: string;
  disabled?: boolean;
}

export interface DrawModal {
  drawModal: boolean;
  drawAccept: () => void;
  drawReject: () => void;
}

export type UserDetailsProps = {
  name?: string;
  timer?: number;
};

export type TimeDropdownProps = {
  selected: string;
  setSelected: (args: string) => void;
  options: string[];
  classname?: string;
};

export type GAuth = {
  credential: string;
  client_id: string;
};
