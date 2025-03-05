import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import { env } from '../config/environment';

// Config cloudinary provider

const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// Initialize a function to upload files to Cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const cloudinaryProvider = { streamUpload }