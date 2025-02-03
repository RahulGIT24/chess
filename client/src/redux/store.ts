import {configureStore} from "@reduxjs/toolkit"
import userReducer from "./reducers/userReducer"
import timeReducer from "./reducers/timeReducer"

export const store = configureStore({
    reducer:{
        user:userReducer,
        time:timeReducer
    }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>;