import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { pipeline } from "stream"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {_id}=req.user
    if(!channelId){
        throw new ApiError(401,"Channel not found")
    }
    if(!_id){
        throw new ApiError(404,"User not authenticated")
    }
    const subscription=await Subscription.findOne({subscriber:_id,channel:channelId})
    if(!subscription){
        const subscription=await Subscription.create({subscriber:_id,channel:channelId})
        if(!subscription){
            throw new ApiError(500,"Cannot create subscription")
        }
        return res.status(200).json(new ApiResponse(200,subscription,"subscribed Successfully"))
    }
    const deletedSubscription=await Subscription.findByIdAndDelete(subscription._id)
    if(!deletedSubscription){
        throw new ApiError(500,"Cannot delete Subscription")
    }
    return res.status(200).json(new ApiResponse(200,subscription,"Subscription deleted Successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400,"channelId is required")
    }
    const channel=new mongoose.Types.ObjectId(channelId)
    const subscriptions=await Subscription.aggregate([
        {
            $match:{channel}
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails",pipeline:[
                {$project:{
                    username:1,
                    email:1
                }}
            ]
            }
        },
        {
            $addFields:{
                User:{
                    $first:"$subscriberDetails"
                }
            }
        },
        {
            $project:{
                subscriberDetails:0
            }
        }
    ])

    console.log(subscriptions)
    return res.status(200).json(new ApiResponse(200,subscriptions,"Subscriptions fetched Successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(400,"subsciber id is required")
    }
    const subscriber=new mongoose.Types.ObjectId(subscriberId)
    const channels=await Subscription.aggregate([
        {
            $match:{
                subscriber
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"Channel",pipeline:[
                    {
                        $project:{
                            username:1,email:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                channelDetails:{
                    $first:"$Channel"
                }
            }
        },
        {
            $project:{
                Channel:0
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,channels,"channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}