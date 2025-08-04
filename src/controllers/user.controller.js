import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessAndReferenceTokens = async(userId) =>{
    try {
     const user = await User.findById(userId)
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()

     user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false })

     return {accessToken, refreshToken}

    } catch (error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

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


   const {fullName, email, username, password} =  req.body // yaha per hmme extract kiye sare ka sare data points 
//    console.log("email:", email);
 //    if(fullName === "") {
//     throw  new ApiError(400, "Full name is required")
//    }

    //per hmmne check kiya ki yaha per kise na empty string to pass to nahi kardi kesi na 
if (
    [fullName, email, username, password]. some
    ((field) =>  field?.trim() === "")
         // => typeof field !== "string" ||
) {
    throw new ApiError(400, "All fields are required")
} 

// ya hmmne check kiya ki already user exist to nahi karta email se ya username se 
 const existedUser = await User.findOne({   
    $or: [{ username }, { email }]
})

//agar karta hai to error dedo varna agaye chalo 
if (existedUser) {
    throw new ApiError(409, "Username or email already exists")
}
    // console.log(req.files);
    //phir hmmne local path nikaal liya avatar ka 
const avatarLocalPath = req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverImage[0]?.path;

let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
}
//agar avatar nahi mila to error throw kar do 
if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
}
//milga to cloudinary per upload kar do 
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

//yah per avatar nahi mila to error throw kar do 
if(!avatar){
    throw new ApiError(400, "All fields are required")
}
 
// agar subko hogaya ha to ye user create kar do 
const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

})

//passwrod aur  refreshtoken hata do jo receive value hai 
const createdUser = await User.findById(user._id).select("-password -refreshToken");

//agar user recreate hua hai to error dedo 
if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)
   
})

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    // find the user 
    //password check 
    // access and refresh token 
    //send cookie

    const {email, username, password} = req.body

    if(username || email){
        throw new ApiError(400, "username or email is required")
    }

   const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid =  await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials ")
    }

  const {accessToken, refreshToken} =  await generateAccessAndReferenceTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password", "-refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshTOken", refreshToken, options)
  .json(
    new ApiResponse( 
        200, 
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "user logged in successfully"
    )
  )


})

const logoutUser = asyncHandler(async(req, res) => {
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    
    const options = {
    httpOnly: true,
    secure: true
  }


  return res
  .status(200)
  .clearCokkies("accessToken", options)
  .clearCokkies("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export {registerUser, loginUser, logoutUser}