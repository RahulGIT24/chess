import { Analyzer } from "../game/Analyzer";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import redis from "../redis/RedisService"
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

export const getGameReviews = (asyncHandler(async (req, res) => {
    try {
        const gameId = req.query.id;
        const userId = req.user.id;
        if (!gameId) throw new ApiResponse(400, null, 'Please provide game id')

        const alreadyReviewed = await prisma.gameReview.findFirst({
            where: {
                gameId: gameId,
                OR: [
                    { blackId: userId },
                    { whiteId: userId }
                ]
            },
            include: {
                blackRef: true,
                whiteRef: true
            }
        })

        if (alreadyReviewed && alreadyReviewed.status === "running") {
            return res.status(200).json(new ApiResponse(200, null, 'Game review is in progress. Please wait for sometime.'))
        }

        if (alreadyReviewed?.id && alreadyReviewed.status === "completed") {
            const black = alreadyReviewed.blackRef.name;
            const white = alreadyReviewed.whiteRef.name;
            const blackImg = alreadyReviewed.blackRef.profilePicture
            const whiteImg = alreadyReviewed.whiteRef.profilePicture
            const id = alreadyReviewed.gameId
            const accuracyWhite = alreadyReviewed.accuracyWhite
            const accuracyBlack = alreadyReviewed.accuracyBlack

            const moveReviews = await prisma.moveReview.findMany({
                where: {
                    gameReviewId: alreadyReviewed.id
                }
            })

            let moves = moveReviews.length;

            const game = {
                black, white, id, moves, accuracyBlack, accuracyWhite,blackImg, whiteImg
            }

            const finalRes = {
                game, moveReviews: moveReviews
            }

            return res.status(200).json(new ApiResponse(200, finalRes, "Game Already Reviewed"))
        }

        const game = await prisma.game.findUnique({
            where: {
                id: gameId,
                OR: [
                    { blackId: userId },
                    { whiteId: userId }
                ]
            },
            select: {
                pgn: true,
                whiteId: true,
                blackId: true
            }
        })

        if (!game) {
            throw new ApiResponse(404, null, "Game not found")
        }

        if (!game.pgn) {
            return res.status(200).json(new ApiResponse(200, null, 'Game is going on'))
        }

        const key = `analyze-game`


        const checkInsertion = await prisma.gameReview.create({
            data: {
                whiteId: game.whiteId,
                blackId: game.blackId,
                gameId: gameId
            }
        })

        if (!checkInsertion.id) {
            throw new ApiResponse(400, null, "Unable to generate review for this game")
        }

        const obj = {
            pgn: game.pgn,
            reviewId: checkInsertion.id,
        }

        const pushed = await redis.lpush(key, JSON.stringify(obj))

        if (pushed == 0) {
            await prisma.gameReview.delete({
                where: {
                    id: checkInsertion.id
                }
            })
            throw new ApiResponse(429, null, 'Too many requests')
        }

        return res.status(200).json(new ApiResponse(200, null, 'Game is submitted for review'))
    } catch (error) {
        console.log(error);
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error);
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
}))