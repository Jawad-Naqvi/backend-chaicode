import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnClooudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async ( req, res) => {
     //get user detailed from frontend
     //validation - mot empty
     //check if user alresdy exists: username, email
    //  check for images, check for avatar
    // upload them to cloudinary, avatar 
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check  for user creation
    //return response to frontend


   const {fullName, email, username, password} =  req.body
   console.log("email:", email);

//    if(fullName === "") {
//     throw  new ApiError(400, "Full name is required")
//    }

if (
    [fullName, email, username, password]. some((field) => field?.trim() === "")
) {
    throw new ApiError(400, "All fields are required")
}

 const existedUser = User.findOne({
    $or: [{ username }, { email }]
})

if (existedUser) {
    throw new ApiError(409, "Username or email already exists")
}

const avatarLocalPath = req.files?.avtar[0]?.path;
const coverImageLocalPath = req.files?.ccoverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
}
const avatar = await uploadOnClooudinary(avatarLocalPath)
const coverImage = await uploadOnClooudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400, "All fields are required")
}
 

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

})

const createdUser = await user.findById(user._id).select("-password -refredhToken")

if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)
   
})


export {registerUser}