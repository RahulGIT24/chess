import { prisma } from "../lib/prisma";
import { SaveInitGame } from "../types/types";

export class GameSave {
    private id: string | null;

    constructor() {
        this.id = null
    }

    async initGameSave(args: SaveInitGame) {
        console.log('args ', args)
        try {
            await prisma.game.create({
                data: args
            })
        } catch (error) {
            throw new Error("Error while saving game")
        }
    }

    async handleResign(playerid: string) {
        try {
            if (this.id) {
                const game = await prisma.game.findFirst({ where: { id: this.id as string } })
                if(!game){
                    throw new Error("Game not found")
                }
                const resignedPlayer = playerid
                if(game.player1!==resignedPlayer && game.player2!==resignedPlayer){
                    throw new Error("Player not found")
                }
                const winner = resignedPlayer===game.player1 ? game.player2 : game.player1;
                await prisma.game.update({
                    where:{
                        id:this.id
                    },
                    data:{
                        winner:winner,
                        resign:resignedPlayer
                    }
                })
            }
        } catch (error:any) {
            throw new Error(error || "Error while saving game")
        }
    }

    async handleWin(playerid: string) {
        try {
            if (this.id) {
                const game = await prisma.game.findFirst({ where: { id: this.id as string } })
                if(!game){
                    throw new Error("Game not found")
                }
                const winner = playerid
                if(game.player1!==winner && game.player2!==winner){
                    throw new Error("Player not found")
                }
                await prisma.game.update({
                    where:{id:this.id},
                    data:{
                        winner:winner
                    }
                })
            }
        } catch (error:any) {
            throw new Error(error || "Error while saving game")
        }
    }

    async handleDraw(){
        try {
            if(this.id){
                await prisma.game.update({
                    where:{
                        id:this.id
                    },
                    data:{
                        draw:true
                    }
                })
            }
        } catch (error:any) {
            throw new Error(error || "Error while saving game")
        }
    }

    setid(id: string) {
        this.id = id
    }
}