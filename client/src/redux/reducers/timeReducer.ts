import { createSlice } from "@reduxjs/toolkit";

interface timer {
    myTimer: number | null,
    opponentTimer: number | null
}

const initialState: timer = {
    myTimer: null,
    opponentTimer: null,
};

const timeSlice = createSlice({
    name: "time",
    initialState,
    reducers: {
        setMyTimer:(state,action)=>{
            state.myTimer = action.payload
        },
        setOpponentTimer:(state,action)=>{
            state.opponentTimer = action.payload
        },
        decrementMyTimer:(state)=>{
            if(state.myTimer && state.myTimer > 0){
                state.myTimer = state.myTimer-1;
            }
        },
        decrementOpponentTimer:(state)=>{
            if(state.opponentTimer && state.opponentTimer > 0){
                state.opponentTimer = state.opponentTimer-1;
            }
        }
    },
});

export const { decrementMyTimer, decrementOpponentTimer,setMyTimer,setOpponentTimer } = timeSlice.actions;
export default timeSlice.reducer;
