import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400,"Video id is required")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video does not exist")
    }
    const {_id}=req.user
    const like=await Like.findOne({video:videoId,likedBy:_id})
    if(!like){
        const like=await Like.create({video:videoId,likedBy:_id})
        if(!like){
            throw new ApiError(500,"Internal server error")
        }
        return res.status(200).json(new ApiResponse(200,like,"Liked the video"))
    }
    const delLike=await Like.findByIdAndDelete(like._id)
    if(!delLike){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,delLike,"Removed Like"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400,"Comment id is required")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"Comment does not exist")
    }
    const {_id}=req.user
    const like=await Like.findOne({comment:commentId,likedBy:_id})
    if(!like){
        const like=await Like.create({comment:commentId,likedBy:_id})
        if(!like){
            throw new ApiError(500,"Internal server error")
        }
        return res.status(200).json(new ApiResponse(200,like,"Liked the comment"))
    }
    const delLike=await Like.findByIdAndDelete(like._id)
    if(!delLike){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,delLike,"Removed Like"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(400,"Tweet id is required")
    }
    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400,"Tweet does not exist")
    }
    const {_id}=req.user
    const like=await Like.findOne({tweet:tweetId,likedBy:_id})
    if(!like){
        const like=await Like.create({tweet:tweetId,likedBy:_id})
        if(!like){
            throw new ApiError(500,"Internal server error")
        }
        return res.status(200).json(new ApiResponse(200,like,"Liked the tweet"))
    }
    const delLike=await Like.findByIdAndDelete(like._id)
    if(!delLike){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,delLike,"Removed Like"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos=await Like.find({video:{$exists: true,$ne:null}})
    if(!likedVideos){
        throw new ApiError(400,"Failed to fetch Liked Videos")
    }
    return res.status(200).json(new ApiResponse(200,likedVideos,"Got liked Videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}