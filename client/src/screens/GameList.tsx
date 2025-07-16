import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { ArrowLeftCircle, Clock, History, Loader2 } from "lucide-react";
import { apiCall } from "../lib/apiCall";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";

interface Player {
    img: string,
    name: string,
    id: string,
    color: "white" | "black",
    rating: Rating[]
}

type Game = {
    id: string;
    players: Player[]
    result: "Draw" | "You Won" | "You Lost";
    draw: boolean;
    createdAt: string;
    duration: number;
};

type Rating = {
    id: string,
    rating: number
}

const columnHelper = createColumnHelper<Game>()

const columns = [
    columnHelper.accessor('duration', {
        header: () => <span>Duration</span>,
        cell: (info) => {
            return (
                <span className="flex-col flex items-center gap-y-2 w-[3vw]">
                    <Clock color="green" />
                    <p className="text-white font-bold">
                        {Math.floor(info.getValue() / 1000 / 60) + " M"}
                    </p>
                </span>
            )
        },
    }),
    columnHelper.accessor("players", {
        header: () => "Players",
        cell: (info) => {
            console.log(info.getValue())
            const players = info.getValue() as {
                color: string;
                id: string;
                img: string;
                name: string;
                rating: Rating[]
            }[];

            return (
                <div className="flex flex-col gap-4 w-full">
                    {players.map((player) => (
                        <div key={player.id} className="flex flex-col  gap-2">
                            <div className="flex flex-col">
                                <span className="font-semibold">{player.name} ({player.rating[0].rating})</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.accessor('result', {
        header: () => <span>Result</span>,
        cell: info => {
            const status = info.getValue()
            return (
                <p className={`${status === "You Won" && "text-green-700"} ${status === "You Lost" && "text-red-500"} ${status === "Draw" && "text-blue-500"} font-semibold`}>
                    {info.getValue()}
                </p>
            )
        },
    }),
    columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('id', {
        header: 'View Game',
        cell: (info) => {
            return (
                <a target="_blank" href={`/game/${info.getValue()}`}><button className="bg-green-700 p-2 rounded-xl font-bold px-7 hover:bg-green-500">View</button></a>
            )
        },
    }),
]

const GameList: React.FC = () => {
    const [data, _setData] = React.useState(() => [])
    const [loading, setLoading] = useState(false);
    const page = useRef<number>(1);
    const [totalPages, setTotalPages] = useState(1)
    const navigate = useNavigate()

    const getData = async () => {
        try {
            setLoading(true)
            const res = await apiCall({
                method: "GET",
                url: `/game/mygames?page=${page.current}`
            })
            _setData(res.data.games)
            setTotalPages(res.data.totalPages)
        } catch (error) {
            // toast.error("Unable to get data")
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [navigate, page])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="p-4 bg-zinc-900 min-h-screen text-white gap-y-10 flex flex-col items-center">
            <div className="w-[50vw] flex gap-x-6 items-center mt-14">
                <div>
                    <ArrowLeftCircle size={30} className="cursor-pointer" onClick={() => navigate("/game")} />
                </div>
                <div className="flex justify-center items-center gap-x-3">
                    <h1 className="font-bold text-2xl">Game History</h1>
                    <History size={30} color="green" />
                </div>
            </div>
            {
                loading ? (
                    <div className="h-[50vh] w-full flex justify-center items-center">
                        <Loader2 className="animate-spin" size={50} color="green" />
                    </div>
                ) :
                    <div className="overflow-x-auto rounded-md shadow-lg w-[50vw]">
                        <table className="min-w-full border border-zinc-950 rounded-lg">
                            <thead className="bg-zinc-800 text-gray-200 uppercase text-sm font-semibold">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="py-3 px-4 text-left border-b border-gray-700"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row, rowIndex) => (
                                    <tr
                                        key={row.id}
                                        className={`${rowIndex % 2 === 0 ? "bg-zinc-800" : "bg-zinc-900"
                                            } hover:bg-gray-700 transition`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="py-3 px-4 border-b border-gray-700 text-gray-300"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination currentPage={page.current} totalPages={totalPages} page={page.current} />
                    </div>
            }
        </div>

    );
};

export default GameList;
