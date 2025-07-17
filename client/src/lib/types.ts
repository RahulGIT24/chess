import { Color, PieceSymbol, Square } from "chess.js";

export type ChessBoardProps = {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  // setBoard: any;
  chess: any;
  myColor: string;
  gamelocked: boolean;
  socket?: WebSocket;
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
export interface User {
  id: string | null;
  name: string | null;
  profilePicture: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}
export type ConfimationProps = {
  text: string;
  buttons: ButtonArr[];
};

export type MoveHistoryComponent = {
  setWaiting?: (arg: boolean) => void;
  socket?: WebSocket;
  gameStarted?: boolean;
  moveHistory: any;
  offerDraw?: () => void;
  onResign?: () => void;
  waiting?: boolean;
  viewGame?:boolean
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
  opponentName: string;
  resignedColor?: string;
  timeUpColor?: string;
  myRating:number | null,
  opponentRating:number | null,
  opponentImage:string
  draw:boolean
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
  opponentProfilePicture?:string|null|undefined
  opponentRating:number|null
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

type PlayerRef = {
    id: string
    name: string
    profilePicture: string
    rating: {
        id: string
        rating: number
        createdAt: string
        updatedAt: string
    }[]
}
export type Game = {
    id: string
    blackId: string
    whiteId: string
    blackRef: PlayerRef
    whiteRef: PlayerRef
    winner: string | null
    winnerRef?: PlayerRef
    draw: boolean
    resign: string | null
    fen: string
    moveHistory: string
    moves: number
    blackTimeLeft: number
    whiteTimeLeft: number
    duration: number
    createdAt: string
    updatedAt: string
    message?: string
}