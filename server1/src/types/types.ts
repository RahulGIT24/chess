import { WebSocket } from "ws"

export interface Move{
    from:string,
    to:string
}

export interface IApiResponse<T>{
    statuscode:number,
    data:T,
    message:string
}

export interface DecodedToken{
    user_id:string
}

export interface IPending{
    socket: WebSocket,
    name: string,
    timeLeft: number
    id:string
    // color?:"white"|"black"
}

export interface Pending extends IPending{
    color:"white" | "black"
}

export interface SaveInitGame{
    id:string,
    player1:string,
    player2:string,
    duration:number
}