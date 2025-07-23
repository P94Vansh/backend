import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    const owner=req.user
    if(!content){
        throw new ApiError(400,"content is required")
    }
    if(!owner){
        throw new ApiError(400,"Unauthorised request")
    }
    const tweet=await Tweet.create({content,owner})
    if(!tweet){
        throw new ApiError(500,tweet,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,"Tweet created Successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId}=req.params
    const owner=new mongoose.userId(userId)
    const tweets=await Tweet.find(owner.userId)
    return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched succesfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {newContent}=req.body
    if(!tweetId){
        throw new ApiError(400,"Tweet is required")
    }
    if(!newContent){
        throw new ApiError(400,"new Content is required")
    }
    const newTweet=await Tweet.findByIdAndUpdate(tweetId,{$set:{content:newContent}},{new:true})
    if(!newTweet){
        throw new ApiError(400,"cannot update the tweet,tweet not found")
    }
    return res.status(200).json(new ApiResponse(200,newTweet,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.params
    if(!tweetId){
        return new ApiError(401,"tweet id is required")
    }
    const deletedTweet= await Tweet.findByIdAndDelete(tweetId)
    if(!deletedTweet){
        return new ApiError(400,"Cannot inf tweet id")
    }
    return res.status(200).json(new ApiResponse(200,deletedTweet,"Tweet deleted Successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}