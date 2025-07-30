import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {_id}=req.user
    const views=await Video.aggregate([
        {$match:{owner:_id}},
        {$addFields:{totalViews:{$sum:"views"},}},
        {$project:{totalViews:1}}
    ])
    const channelView=views[0]?.totalViews
    const subscribers=await Subscription.aggregate([
        {$match:{channel:_id}},
        {$count:"subscriberCount"}
    ])
    const channelSubscriber=subscribers[0]?.subscriberCount
    const totalVideos=await Video.aggregate([
        {$match:{owner:_id}},
        {$count:"totalVideos"}
    ])
    const channelVideos=totalVideos[0]?.totalVideos
    const likes=await Video.aggregate([
        {$match:{owner:_id}},
        {$lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"video",
            as:"LikeVideos"
        }},
        {$count:"totalLikes"}
    ])
    const channelLikes=likes[0]?.totalLikes
    return res.status(200).json(new ApiResponse(200,{channelView,channelSubscriber,channelVideos,channelLikes},"fetched Successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const {_id}=req.user
    const videos=await Video.find({owner:_id})
    if(!videos){
        throw new ApiError(400,"cannot fetch videos")
    }
    return res.status(200).json(new ApiResponse(200,videos,"videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }