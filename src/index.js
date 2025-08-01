// require('dotenv').config()
// import { DB_NAME } from "./constants";
// // import constnats from "./constants.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
// import express from "express";
import {app} from "./app.js";


dotenv.config({
    path: './.env'
})

// const app = express();


connectDB()
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port: ${process.env.PORT}`);
    // console.log(`Server is running at port: ${process.env.PORT} || 8000`);  agar mai import karu express ko to mujhe  const app = express() likna padega aur || 8000 likhne ki zarurut hai mongoDB connect karna ka liye 
  })
})
.catch((err) => {
    console.log("MONGO DB CONNECTION FAILED !!! ", err);
})







  

// import express from "express";
// const app = express()

//  ( async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}` )
//        app.on("error", (error) => {
//         console.log("ERROR: ", error);
//         throw error;
//        })


//        app.listen(process.env.PORT, () => {
//         console.log(`App is listening on port ${process.env.PORT}`);
//        })

//     } catch (error) {
//         console.error("Error: ", error);
//         throw error;
//     }
//  })()