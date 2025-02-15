import { prisma } from "../lib/prisma";
import { SaveInitGame } from "../types/types";

export class GameSave {
    private id: string | null;

    constructor() {
        this.id = null
    }

    async initGameSave(args: SaveInitGame) {
        try {
            const id = args.id;
            const findGame = await prisma.game.findFirst({
                where:{id}
            })
            if(!findGame){
                await prisma.game.create({
                    data: args
                })
            }
        } catch (error) {
            throw new Error("Error while saving game")
        }
    }

    async handleResign(playerid: string) {
        try {
            if (this.id) {
                const game = await prisma.game.findFirst({ where: { id: this.id as string } })
                if (!game) {
                    throw new Error("Game not found")
                }
                const resignedPlayer = playerid
                if (game.player1 !== resignedPlayer && game.player2 !== resignedPlayer) {
                    throw new Error("Player not found")
                }
                const winner = resignedPlayer === game.player1 ? game.player2 : game.player1;
                await prisma.game.update({
                    where: {
                        id: this.id
                    },
                    data: {
                        winner: winner,
                        resign: resignedPlayer
                    }
                })
                await this.updateRating({ winner, loser: resignedPlayer })
            }
        } catch (error: any) {
            throw new Error(error || "Error while saving game")
        }
    }

    async handleWin(playerid: string) {
        try {
            if (this.id) {
                const game = await prisma.game.findFirst({ where: { id: this.id as string } })
                if (!game) {
                    throw new Error("Game not found")
                }
                const winner = playerid
                const loser = game.player1 === winner ? game.player2 : game.player1;
                if (game.player1 !== winner && game.player2 !== winner) {
                    throw new Error("Player not found")
                }
                await prisma.game.update({
                    where: { id: this.id },
                    data: {
                        winner: winner
                    }
                })
                await this.updateRating({ winner: winner, loser })
            }
        } catch (error: any) {
            throw new Error(error || "Error while saving game")
        }
    }

    async handleDraw() {
        try {
            if (this.id) {
                await prisma.game.update({
                    where: {
                        id: this.id
                    },
                    data: {
                        draw: true
                    }
                })
            }
        } catch (error: any) {
            throw new Error(error || "Error while saving game")
        }
    }

    async updateRating({ winner, loser }: { winner: string, loser: string }) {
        const winnerT = await prisma.rating.upsert({
            where: { player: winner },
            update: {}, 
            create: { player: winner, rating: 500 }
        });

        const loserT = await prisma.rating.upsert({
            where: { player: loser },
            update: {},
            create: { player: loser, rating: 500 }
        });
        
        await Promise.all([
            prisma.rating.update({
                where: { player: winner },
                data: { rating: winnerT.rating + 15 }
            }),
            prisma.rating.update({
                where: { player: loser },
                data: { rating: loserT.rating - 20 }
            })
        ]);
    }
    

    async checkCompatibility({player1,player2}:{player1:string,player2:string}):Promise<boolean>{
        const player1Rating = await this.getUserRating(player1)
        const player2Rating = await this.getUserRating(player2)

        if(player1Rating==null || player2Rating==null){
            return true
        }

        if(player1Rating-player2Rating <= 75){
            return true;
        }
        return false;
    }

    async getUserRating(userid:string):Promise<number | null>{
        const playerRating = await prisma.rating.findFirst({
            where:{
                player:userid
            },
            select:{
                rating:true
            }
        })
        if(playerRating){
            return playerRating.rating
        }
        return null;
    }

    setid(id: string) {
        this.id = id
    }
}