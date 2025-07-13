import { useNavigate } from "react-router-dom"
import GoogleAuth from "../components/GoogleAuth"
import { useAuth } from "../hooks/useAuth"
// import { v4 as uuidv4 } from "uuid"
// import { useDispatch } from "react-redux"
// import { setGuest, setUser } from "../redux/reducers/userReducer"
import { useEffect } from "react"

const Landing = () => {
    const navigate = useNavigate()
    const [isAuthenticated] = useAuth()
    // const dispatch = useDispatch();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/game");
        }
    }, [isAuthenticated]);

    // const guest = () => {
    //     const randomId = uuidv4().slice(0, 9);
    //     const guestName = "GUEST_" + randomId
    //     const user = {
    //         id: null,
    //         name: guestName,
    //         profilePicture: null,
    //         email: null
    //     }
    //     // console.log(user)
    //     dispatch(setUser(user))
    //     dispatch(setGuest(true));
    //     setTimeout(() => {
    //         navigate("/game?guest=true")
    //     }, 100);
    // }

    return (
        <div className="h-screen w-full flex justify-center items-center bg-zinc-800">
            <div>
                <div className="grid md:grid-cols-2 gap-4 sm:grid-cols-1">
                    <div>
                        <img src="/chess.png" />
                    </div>
                    <div className="flex justify-center items-center flex-col">
                        <h1 className="text-5xl text-center font-bold text-white mb-14">Play Chess Online</h1>
                        <div className="mt-4 flex justify-center items-center flex-col gap-y-4">
                            {/* <Button onClick={()=>{guest()}} classname="w-full">
                                Play Online as Guest
                            </Button>
                            <p className="text-white">OR</p> */}
                            <GoogleAuth />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing