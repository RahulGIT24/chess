import { IPending } from "../types/types";

export class PendingUser {
    private pendingUsers: IPending[] | null;

    constructor() {
        this.pendingUsers = [];
        console.log(this.pendingUsers);
    }

    enque(args: IPending) {
        this.pendingUsers?.push(args);
    }

    deque(time: number, userId: string) {
        const index = this.pendingUsers?.findIndex((t: IPending) => t.timeLeft === time && t.id !== userId);
        if (index === -1 || index === undefined) {
            return null;
        }
        return this.pendingUsers?.splice(index, 1)[0] || null;
    }
    
}