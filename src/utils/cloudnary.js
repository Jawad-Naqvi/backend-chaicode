import {v2 as cloudinary} from 'cloudinary';  
import fs from 'fs';    



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });


    const uploadOnClooudinary = async (localFilePath) => {
        try{
            if (!localFilePath) return null
            // upload the file on cloudinnary
           const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            })
            // file has been uploaded successfull
            console.log("file is uploaded on cloudinary", response.url);
            return response;
        }catch(error){
            fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed 
            return null;
        }
    }
    
    export {uploadOnClooudinary} 
 
