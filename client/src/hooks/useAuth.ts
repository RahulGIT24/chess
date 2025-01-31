import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiCall } from "../lib/apiCall";
import { GET } from "../constants/methods";
import { setAuthenticated, setUser } from "../redux/reducers/userReducer";
import { RootState } from "../redux/store";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.user);

    async function getUser() {
        try {
            const res = await apiCall({ method: GET, url: "/auth/get-user", data: {} });
            dispatch(setAuthenticated(true));
            dispatch(setUser(res.data));
        } catch (error) {
            dispatch(setAuthenticated(false));
            dispatch(setUser(null));
        }
    }

    useEffect(() => {
        getUser();
    }, []);

    return [ user, isAuthenticated ];
};
