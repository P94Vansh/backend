import mongoose, { mongo, Mongoose } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400,"video id is required")
    }
    const {page = 1, limit = 10} = req.query
    const video=new mongoose.Types.ObjectId(videoId)
    const pipeline=[
        {
            $match:{video}
        }
    ]
    const comments=await Comment.aggregatePaginate(pipeline,{page,limit})
    return res.status(200).json(new ApiResponse(400,comments,"comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const {content}=req.body
    const {videoId}=req.params
    const {_id}=req.user
    if(!content){
        throw new ApiError(400,"Content is required")
    }
    if(!videoId){
        throw new ApiError(400,"Video id is required")
    }
    if(!_id){
        throw new ApiError(401,"User is not authenticated")
    }
    const comment=await Comment.create({video:videoId,content,owner:_id})
    if(!comment){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,comment,"Comment created Successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params
    const {content}=req.body
    if(!commentId){
        throw new ApiError(400,"comment id is required")
    }
    const {_id}=req.user
    const comment=await Comment.findById(commentId)
    const commentStr=String(comment.owner)
    const _idStr=String(_id)
    if(commentStr!=_idStr){
        throw new ApiError(401,"user is not authenticated to do comment")
    }
    const updatedComment=await Comment.findByIdAndUpdate(commentId,{content},{new:true})
    if(!updatedComment){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated Successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    if(!commentId){
        throw new ApiError(400,"Comment id is required")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(401,"Comment does not exist")
    }
    const commentOwner=String(comment.owner)
    const {_id}=req.user
    const _idStr=String(_id)
    if(commentOwner!==_idStr){
        throw new ApiError(400,"User is not authenticated to delete this comment")
    }
    const deletedComment=await Comment.findByIdAndDelete(commentId)
    return res.status(200).json(new ApiResponse(200,deletedComment,"Comment deleted Successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }