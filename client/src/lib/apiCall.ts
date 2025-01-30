import axios from "axios"
import toast from "react-hot-toast"
import { refreshAccessToken } from "./refreshAccessToken"

type apiCallParams = {
    url: string,
    data: any,
    method: string
}

export const apiCall = async ({ method, data={},url }: apiCallParams) => {
    const options = {
        method: method, 
        url: import.meta.env.VITE_SERVER_URL + url,
        headers: {
            "Content-Type": "application/json",
        },
        data: data,
        withCredentials:true
    };
    try {
        const res = await axios(options)
        return res.data
    } catch (error: any) {
        if(error.status===403){
            await refreshAccessToken();
            return;
        }
        throw new Error(error?.response?.data.message)
    }
}