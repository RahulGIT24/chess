import { WebSocket } from "ws";
import { IPending } from "../types/types";

interface Deque{
    userId?:string
    time?:number
    socket?:WebSocket
}

export class PendingUser {
    private pendingUsers: IPending[] | null;

    constructor() {
        this.pendingUsers = [];
    }

    enque(args: IPending) {
        this.pendingUsers?.push(args);
    }

    deque({userId,time,socket}:Deque) {
        let index=-1;
        if(userId && time){
            index = this.pendingUsers?.findIndex((t: IPending) => t.timeLeft === time && t.id !== userId) ?? -1;
        }
        if(socket){
            index = this.pendingUsers?.findIndex((t: IPending) => t.socket === socket) ?? -1;
        }
        if (index === -1) {
            return null;
        }
        return this.pendingUsers?.splice(index, 1)[0] || null;
    }
}