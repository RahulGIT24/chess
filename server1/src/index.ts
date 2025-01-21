import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    gameManager.addUser(ws);

    ws.on("close",()=>gameManager.removeUser(ws))

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
});