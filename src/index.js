// require('dotenv').config({path:'./env'})
// import 'dotenv/config'
import connectDB from "./db/index.js";
import { app } from "./app.js";
connectDB().then(()=>{
    app.on("error",(e)=>{
        console.log("Error",e)
        throw e
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port ${process.env.PORT}`)
    })
}
).catch(err=> {
    console.log("Mogodb connection failed!!!",err)
})

























/*
import express from 'express'
const app=express()
(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    }
    catch(e){
        console.error("Error: ",e)
        throw e
    }
})()
*/  