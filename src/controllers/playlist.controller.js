import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const {_id}=req.user
    if(!name){
        throw new ApiError(400,"name is required")
    }
    if(!description){
        throw new ApiError(400,"description is required")
    }
    const playlist=await Playlist.create({name,description,owner:_id})
    if(!playlist){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"playlist created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"user id is required")
    }
    const playlist=await Playlist.find({owner:userId})
    if(!playlist){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"user playlists fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400,"playlist id is required")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Did not found playlist")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Fetched"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId){
        throw new ApiError(400,"Playlist is requried")
    }
    if(!videoId){
        throw new ApiError(400,"Video is requried")
    }
    const {_id}=req.user
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist doesn't exist")
    }
    if(String(playlist.owner)!=String(_id)){
        throw new ApiError(401,"User is not authenticated to perform this operation")
    }
    const newplaylist=await Playlist.findByIdAndUpdate(playlistId,{$push:{videos:new mongoose.Types.ObjectId(videoId)}},{new:true})
    if(!newplaylist){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,newplaylist,"Video Added Successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId){
        throw new ApiError(400,"Playlist is requried")
    }
    if(!videoId){
        throw new ApiError(400,"Video is requried")
    }
    const {_id}=req.user
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist doesn't exist")
    }
    if(String(playlist.owner)!=String(_id)){
        throw new ApiError(401,"User is not authenticated to perform this operation")
    }
    const newplaylist=await Playlist.findByIdAndUpdate(playlistId,{$pull:{videos:new mongoose.Types.ObjectId(videoId)}},{new:true})
    if(!newplaylist){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,newplaylist,"Video Removed Successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400,"Playlist is requried")
    }
    const {_id}=req.user
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist doesn't exist")
    }
    if(String(playlist.owner)!=String(_id)){
        throw new ApiError(401,"User is not authenticated to perform this operation")
    }
    const newplaylist=await Playlist.findByIdAndDelete(playlistId,{new:true})
    if(!newplaylist){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,newplaylist,"Playlist Removed Successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId){
        throw new ApiError(400,"Playlist is requried")
    }
    if(!name){
        throw new ApiError(400,"name is required")
    }
    if(!description){
        throw new ApiError(400,"Description is required")
    }
    const {_id}=req.user
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist doesn't exist")
    }
    if(String(playlist.owner)!=String(_id)){
        throw new ApiError(401,"User is not authenticated to perform this operation")
    }
    const newplaylist=await Playlist.findByIdAndUpdate(playlistId,{name,description},{new:true})
    if(!newplaylist){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,newplaylist,"Playlist Updated Successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}