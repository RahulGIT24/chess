import { UserMoves } from '../screens/Game'

const UserMovesSection = ({ moves,color }: { moves: UserMoves[],color:string }) => {
    return (

        <div className="overflow-x-auto flex justify-start items-start flex-row scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent gap-x-3 bg-zinc-600 w-full py-3 px-3 h-12">
            {
                moves && moves.length > 0 && moves.map((m, i) => (
                    <div className='flex justify-center items-center gap-x-2' key={i}>
                        <img src={`/${color === "black" ? m.piece : m.piece.toUpperCase() + " copy"}.png`} className='w-3 h-5' alt="" /><p >{m.place}</p>
                    </div>
                ))
            }
        </div>
    )
}

export default UserMovesSection