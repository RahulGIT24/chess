import { GET } from "../constants/methods";
import { apiCall } from "./apiCall";

export const refreshAccessToken = async()=>{
    try {
        apiCall({url:"/auth/refresh-token",data:{},method:GET})
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}