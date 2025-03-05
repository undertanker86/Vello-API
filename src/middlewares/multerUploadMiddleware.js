import multer from 'multer'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '../utils/validators.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'


// Function to check valid files.
const fileFilter = (req, file, callback) => {
  // For multer, check type file will be in file.mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'File type is not supported.'), null)
  }

  // If type file is valid
  return callback(null, true)
}

// Init upload function by multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: fileFilter
})

export const multerUploadMiddleware = { upload }