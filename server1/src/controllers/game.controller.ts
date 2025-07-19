// import { ChessAnalyzer } from "../game/ChessAnalyzer";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";

// const analyzer = new ChessAnalyzer()

export const getGame = asyncHandler(async (req, res) => {
    try {
        const { gameId } = req.query;

        if (!gameId) {
            throw new ApiResponse(400, null, "Please Provide Game Id");
        }

        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
                blackRef: {
                    select: {
                        name: true,
                        id: true,
                        rating: true,
                        profilePicture: true
                    }
                },
                whiteRef: {
                    select: {
                        name: true,
                        id: true,
                        rating: true,
                        profilePicture: true
                    }
                },
                winnerRef: {
                    select: {
                        name: true,
                        id: true,
                        rating: true,
                        profilePicture: true
                    }
                }
            }
        });

        if (game && !game.winner && !game.draw) return res.status(200).json(new ApiResponse(200, null, "Game is going on"));

        if (!game) {
            return res.status(404).json(new ApiResponse(404, null, "Game not found"));
        }

        return res.status(200).json(new ApiResponse(200, game, "Game Fetched"));

    } catch (error) {
        console.log(error);
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error);
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});

export const getGamesOfUser = asyncHandler(async (req, res) => {
    try {
        const { page } = req.query ?? 1;
        if (page <= 0) {
            throw new ApiResponse(400, null, "Invalid Page Reference")
        }
        const userId = req.user.id

        const games = await prisma.game.findMany({
            where: {
                OR: [
                    { whiteId: userId },
                    { blackId: userId }
                ]
            },
            include: {
                whiteRef: { select: { id: true, name: true, profilePicture: true, rating: true } },
                blackRef: { select: { id: true, name: true, profilePicture: true, rating: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * 10,
            take: 10
        });

        const totalDocs = await prisma.game.count({
            where: {
                OR: [
                    { whiteId: userId },
                    { blackId: userId }
                ]
            }
        })

        const totalPageSize = 10
        const totalPages = Math.ceil(totalDocs / totalPageSize);

        const formattedGames = games.map((game) => ({
            id: game.id,
            players: [
                {
                    color: "black",
                    id: game.blackRef.id,
                    img: game.blackRef.profilePicture || "",
                    name: game.blackRef.name,
                    rating: game.blackRef.rating
                },
                {
                    color: "white",
                    id: game.whiteRef.id,
                    img: game.whiteRef.profilePicture || "",
                    name: game.whiteRef.name,
                    rating: game.whiteRef.rating
                },
            ],
            createdAt: new Date(game.createdAt).toLocaleDateString("en-GB"),
            draw: game.draw,
            duration: game.duration,
            result: !game.winner && game.draw ? "Draw" : game.winner === userId ? "You Won" : "You Lost",
        }));



        return res.status(200).json(new ApiResponse(200, { games: formattedGames, totalPages }, "User Games Fetched"));
    } catch (error) {
        console.log(error);
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error);
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
})

// export const getGameReviews= (asyncHandler(async(req,res)=>{
//     try {
//         const gameId = req.query.id;
//         if(!gameId) throw new ApiResponse(400,null,'Please provide game id')

//         const game = await prisma.game.findUnique({
//             where:{
//                 id:gameId
//             },
//             select:{
//                 pgn:true
//             }
//         })

//         if(!game){
//             throw new ApiResponse(404,null,"Game not found")
//         }   

//         if(!game.pgn){
//             return res.status(200).json(new ApiResponse(200,null,'Game is going on'))
//         }
//         await analyzer.init();
//         const analyzedGame = await analyzer.analyzePGN(game.pgn)

//         return res.status(200).json(new ApiResponse(200,analyzedGame,"Game Reviews Fetched"))
//     } catch (error) {
//         console.log(error);
//         if (error instanceof ApiResponse) {
//             return res.status(error.statuscode).json(error);
//         }
//         return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
//     }
// }))