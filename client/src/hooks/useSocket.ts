import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { CONNECT } from "../constants/messages";

const WS_URL = import.meta.env.VITE_WS_URL

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { user } = useSelector((state: RootState) => state.user);

    const connectSocket = (socket:WebSocket)=>{
        if(user && socket){
            const type = CONNECT;
            const id = user.id;
            socket.send(JSON.stringify({type,id}));
        }
    }

    useEffect(() => {
        const ws = new WebSocket(WS_URL)

        ws.onopen = () => {
            setSocket(ws)
            connectSocket(ws)
        }

        ws.onclose = ()=>{
            setSocket(null)
        }

        return ()=>{
            ws.close()
        }
    }, [])

    return socket;
}