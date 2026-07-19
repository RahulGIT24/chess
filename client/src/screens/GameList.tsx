import React, { useEffect, useState } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { ArrowLeft, Clock, Eye, History, Loader2, SearchCheckIcon } from "lucide-react";
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
                <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold-400" />
                    <span className="font-mono text-sm font-semibold text-cream">
                        {Math.floor(info.getValue() / 1000 / 60) + " min"}
                    </span>
                </span>
            )
        },
    }),
    columnHelper.accessor("players", {
        header: () => "Players",
        cell: (info) => {
            const players = info.getValue() as {
                color: string;
                id: string;
                img: string;
                name: string;
                rating: Rating[]
            }[];

            return (
                <div className="flex w-full flex-col gap-1.5">
                    {players.map((player) => (
                        <div key={player.id} className="flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full border ${player.color === "white" ? "border-white/40 bg-cream" : "border-white/20 bg-ink-900"}`}
                            />
                            <span className="text-sm font-medium text-cream">
                                {player.name}
                                <span className="ml-1.5 font-mono text-xs text-gold-400">{player.rating[0].rating}</span>
                            </span>
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
            const style =
                status === "You Won"
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                    : status === "You Lost"
                        ? "border-red-500/25 bg-red-500/10 text-red-300"
                        : "border-gold-500/25 bg-gold-500/10 text-gold-300";
            return (
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${style}`}>
                    {status}
                </span>
            )
        },
    }),
    columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: info => <span className="text-sm text-cream/60">{info.getValue()}</span>,
    }),
    columnHelper.accessor('id', {
        header: 'View',
        cell: (info) => {
            return (
                <a
                    target="_blank"
                    title="View Game"
                    href={`/game/${info.getValue()}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-colors hover:border-gold-500/40 hover:bg-white/[0.08]"
                >
                    <Eye className="h-4 w-4 text-gold-400" />
                </a>
            )
        },
    }),
    columnHelper.accessor('id', {
        header: 'Review',
        cell: (info) => {
            return (
                <a
                    target="_blank"
                    title="Review Game"
                    href={`/gamereview/${info.getValue()}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-colors hover:border-gold-500/40 hover:bg-white/[0.08]"
                >
                    <SearchCheckIcon className="h-4 w-4 text-gold-400" />
                </a>
            )
        },
    }),
]

const GameList: React.FC = () => {
    const [data, _setData] = React.useState(() => [])
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState(1)
    const navigate = useNavigate()

    const getData = async () => {
        try {
            setLoading(true)
            const res = await apiCall({
                method: "GET",
                url: `/game/mygames?page=${page}`
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
        <div className="board-grid-bg relative flex min-h-screen flex-col items-center bg-ink-950 p-6 text-cream">
            {/* Ambient light */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-gold-500/[0.08] blur-[130px]" />
            </div>

            <div className="relative z-10 mt-12 flex w-full max-w-4xl items-center gap-x-5">
                <button
                    onClick={() => navigate("/game")}
                    title="Back to game"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:border-gold-500/40 hover:bg-white/[0.08]"
                >
                    <ArrowLeft className="h-5 w-5 text-cream/70" />
                </button>
                <div className="flex items-center gap-x-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10">
                        <History className="h-5 w-5 text-gold-400" />
                    </span>
                    <div>
                        <h1 className="heading-display text-3xl">Game history</h1>
                        <p className="text-xs text-cream/40">Every game you've played, saved forever</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-8 w-full max-w-4xl">
                {
                    loading ? (
                        <div className="flex h-[50vh] w-full items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-gold-400" />
                        </div>
                    ) :
                        <div className="panel overflow-hidden !rounded-2xl">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <tr key={headerGroup.id} className="border-b border-white/[0.08] bg-white/[0.03]">
                                                {headerGroup.headers.map((header) => (
                                                    <th
                                                        key={header.id}
                                                        className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50"
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
                                        {table.getRowModel().rows.length === 0 && (
                                            <tr>
                                                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-cream/40">
                                                    No games yet — play your first game to see it here.
                                                </td>
                                            </tr>
                                        )}
                                        {table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-gold-500/[0.04]"
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className="px-5 py-4"
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-white/[0.06] pb-4">
                                <Pagination currentPage={page} totalPages={totalPages} setPage={setPage} />
                            </div>
                        </div>
                }
            </div>
        </div>

    );
};

export default GameList;
