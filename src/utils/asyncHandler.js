const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, req, next)).catch((err) => next(err))
    }
}

export {asyncHandler}




// const asuncHandler = (fn) => async (req, res, next) => {
//     try {

//     }catch (error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }


