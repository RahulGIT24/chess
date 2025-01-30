export interface Move{
    from:string,
    to:string
}

export interface IApiResponse<T>{
    statuscode:number,
    data:T,
    message:string
}

export interface DecodedToken{
    user_id:string
}