import redis from "../redis/RedisService"
import { Analyzer } from "./Analyzer" 

export const gameAnalyzeScheduler = async()=>{
    try {
        const analyze = new Analyzer();
        const key=`analyze-game`

        while (true) {

            const data = await redis.brpop(key,0)

            if(!data) continue;

            const parsedData = JSON.parse(data[1])
            await analyze.analyzePGNGame(parsedData.pgn,parsedData.reviewId,parsedData.gameId);
        }

    } catch (error) {
        console.log(error)
        console.log("Failed to parse game")
    }
}

gameAnalyzeScheduler()