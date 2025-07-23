import mongoose,{Mongoose, Schema} from "mongoose";
const playListSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:[
        {
            type:Schema.ObjectId,
            ref:"Video"
        }
    ],
    owner:{
        type:Schema.ObjectId,
        ref:"User"
    }
},{timestamps:true})
export const Playlist=mongoose.model("Playlist",playListSchema)