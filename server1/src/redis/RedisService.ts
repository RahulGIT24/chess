import Redis from "ioredis";

class RedisClient{
    private static instance:Redis;

    private constructor() {}

    static getInstance():Redis{
        if(!this.instance){
            this.instance = new Redis({
                host:process.env.REDIS_HOST!,
                port:Number(process.env.REDIS_PORT)
            })
        }
        return this.instance;
    }
}

export default RedisClient.getInstance();