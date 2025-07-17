import useSound from "use-sound"
import { CAPTURE_SOUND, CASTLE_SOUND, CHECK, GAME_END, GAME_START, ILLEGAL, MOVE_SELF, PROMOTE, TIME_ENDING } from "../constants/sounds"

export const useSoundEffects = () => {
    const [capture] = useSound(CAPTURE_SOUND)
    const [castle] = useSound(CASTLE_SOUND)
    const [gameend] = useSound(GAME_END)
    const [gamestart] = useSound(GAME_START)
    const [move] = useSound(MOVE_SELF)
    const [promote] = useSound(PROMOTE)
    const [timending] = useSound(TIME_ENDING)
    const [error] = useSound(ILLEGAL)
    const [check] = useSound(CHECK)

    return {
        capture, castle, gameend, gamestart, move,
        promote, timending,error, check
    }
}