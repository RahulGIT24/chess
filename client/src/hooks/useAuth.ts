import { useEffect, useState } from "react"
import { apiCall } from "../lib/apiCall";
import { GET } from "../constants/methods";

export const useAuth = ()=>{
    const [user,setUser] = useState<null>(null);
    const [authenticated,setAuthenticated] = useState<boolean>(false);

    async function getUser(){
        try {
            const res = await apiCall({method:GET,url:"/auth/get-user",data:{}})
            setAuthenticated(true);
            setUser(res.data.data);
        } catch (error) {
            setAuthenticated(false)
            return error
        }
    }

    useEffect(()=>{
        getUser()
    },[])

    return [user,authenticated];
}