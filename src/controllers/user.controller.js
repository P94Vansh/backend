import {ApiError} from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser=asyncHandler(async (req,res)=>{
    //get user details from frontend
    // validation- not empty
    // check if user already existed: username and email
    //check for images, check for avatar
    // upload them to cloudanary,avatar
    //create user object- create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res
    const {username,email,fullName,password}=req.body
    console.log("email: ",email)
    if([fullName,email,username,password].some((field)=> field?.trim()==="")){
        throw new ApiError(400,"All fields are compulsary and required")
    }
    const existedUser=User.findOne({$or: [{username},{email}]})
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImagLocalPath=req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImagLocalPath)
    if(avatar){
        throw new ApiError(400,"Avatar file is required") 
    }
    const user=await User.create({fullName,avatar:avatar.url,coverImage:coverImage?.url || "",email,password,username:username.toLowerCase()})

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
})
export {registerUser}