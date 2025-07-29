import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNum=Number(page,10)
    const limitNum=Number(limit,10)
    const pipeline=[]
    if(query){
        pipeline.push({
            $match:{
                $or:[
                    {title:{$regex:query,$options:'i'}},
                    {description: { $regex: query, $options: 'i' }}
                ]
            }
        })
    }
    if(userId){
        pipeline.push({
            $owner:{user:userId}
        })
    }
    const sortStage = {
        $sort: {
            [sortBy]: sortType === 'asc' ? 1 : -1
        }
    };
    pipeline.push(sortStage)
    const aggregate = Video.aggregate(pipeline);
    const options = { page: pageNum, limit: limitNum };

    const videos = await Video.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, 'Videos fetched successfully'));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const videoFileLocalPath=req.files?.videoFile[0]?.path
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path
    const {_id}=req.user
    if(!title){
        throw new ApiError(400,"title is required")
    }
    if(!description){
        throw new ApiError(400,"desciption is required")
    }
    if(!videoFileLocalPath){
        throw new ApiError(400,"video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required")
    }
    const videoFile=await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(500,"Cannot upload thumbnail on cloudinary")
    }
    if(!videoFile){
        throw new ApiError(500,"cannot upload videofile on cloudinary")
    }
    const video=await Video.create({videoFile:videoFile.url,thumbnail:thumbnail.url,title,description,duration:videoFile.duration,owner:_id})
    if(!video){
        throw new ApiError(500,"cannot create video document")
    }
    return res.status(200).json(new ApiResponse(200,video,"video created successfully"))
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"Need Correct Video Id")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Invalid Video Id")
    }
    return res.status(200).json(new ApiResponse(200,video,"Video fetched Successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        return new ApiError(400,"Video id is required")
    }
    const {title,description}=req.body
    if(!title){
        return new ApiError(400,"Title is required")
    }
    if(!description){
        return new ApiError(400,"Description is required")
    }
    const thumbnail=req.file
    const cloudinaryres=await uploadOnCloudinary(thumbnail.path)
    const video=await Video.findByIdAndUpdate(videoId,{
        title,
        description,
        thumbnail:cloudinaryres.url
    },{new:true})
    if(!video){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,video,"Video updated successfully"))
})
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"video id is required")
    }
    const video=await Video.findByIdAndDelete(videoId)
    if(!video){
        throw new ApiError(500,"Unable to delete video")
    }
    return res.status(200).json(new ApiResponse(200,video,"Video Deleted Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"Video id is required")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Cannot find the video")
    }
    const isPublished=video.isPublished
    const newVideo  = await Video.findByIdAndUpdate(videoId,{isPublished:!isPublished},{new:true})
    if(!newVideo){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,newVideo,"published status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}