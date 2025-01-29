import { IApiResponse } from "../types/types";

export class ApiResponse<T=any> implements IApiResponse<T>{
    statuscode:number;
    data: T;
    message: string;
    constructor(statuscode:number,data:T,message:string){
        this.statuscode=statuscode
        this.data=data
        this.message=message
    }
}