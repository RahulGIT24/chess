import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        required:[true,"Name is Required"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        index:true
    },
    profilePicture:{
        type:String,
    }
},{
    timestamps:true
})

const User = mongoose.model("User",userSchema)

export default User