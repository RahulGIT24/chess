import { WebSocket } from "ws";

export interface IPending{
    socket: WebSocket, name: string, timeLeft: number
}

export class PendingUser {
    private pendingUsers:IPending[] | null;

    constructor(){
        this.pendingUsers = [];
    }

    enque(args:IPending){
        this.pendingUsers?.push(args);
    }
    
    deque(time:number){
        const index = this.pendingUsers?.findIndex((t:IPending)=>t.timeLeft===time)
        if(index==-1 || index == undefined){
            return null;
        }
        return this.pendingUsers?.splice(index, 1)[0] || null;
    }
}