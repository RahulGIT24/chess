import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./messages";

export class GameManager{
    private games:Game[]
    private pendingUser: {socket:WebSocket,name:string,timeLeft:number} | null
    private users: WebSocket[]

    constructor(){
        this.games = []
        this.users=[]
        this.pendingUser = null;
    }

    addUser(socket:WebSocket){
        this.users.push(socket)
        this.addHandler(socket)
    }

    removeUser(socket:WebSocket){
        this.users = this.users.filter(user=>user!==socket)
    }

    private addHandler(socket:WebSocket){
        socket.on("message",(data)=>{
            const message = JSON.parse(data.toString())
            const username = message.name;
            
            if(message.type===INIT_GAME){
                console.log("message",message)
                if(this.pendingUser){
                   // const game = new Game(this.pendingUser,{socket,name:username,timeLeft:0}, message.time)
                   const game = new Game(this.pendingUser,{socket,name:username,timeLeft:0}, message.time)
                    
                   this.games.push(game);
                    this.pendingUser = null;
                }else{
                    this.pendingUser = {socket,name:username,timeLeft:0} //phatega yaha
                }
            }

            
            if(message.type===MOVE){
                const game = this.games.find(game=>game.player1===socket || game.player2===socket)
                if(game){
                    game.makeMove(socket,message.payload.move)
                }
            }
        })
    }
}