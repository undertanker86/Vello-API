import { userModel } from '../models/userModel.js'
import ApiError from "../utils/ApiError"
import { StatusCodes } from "http-status-codes"
import bcryptjs from 'bcryptjs'
import {v4 as uuidv4} from 'uuid'
import { pickUser } from '../utils/formatters.js'
import { WEBSITE_DOMAIN } from '../utils/constants.js'
import sendMail from '../providers/sendMailProvider.js'
import { env } from '../config/environment.js'
import { jwtProvider } from '../providers/JwtProvider.js'
import { cloudinaryProvider } from '../providers/cloudinaryProvider.js'


const createNew = async (reqBody) => {
 try {
  // Check email already exists in the database
  const existUser = await userModel.findOneByEmail(reqBody.email)
  if(existUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
  }
  // Create Data
  const nameEmail = reqBody.email.split('@')[0] // abc@gmail.com -> abc
  const newUser = {
    email: reqBody.email,
    password: bcryptjs.hashSync(reqBody.password, 10), // Hash password
    username: nameEmail,
    displayName: nameEmail,
    verifyToken: uuidv4()
  }
  // Save data to the database
  const createdUser = await userModel.createNew(newUser)
  const getUser = await userModel.findOneById(createdUser.insertedId)

  // Send mail to verify user email
  const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getUser.email}&token=${getUser.verifyToken}`
  const customSubject = 'Vello: Please verify your email address before using our services!'
  const htmlContent = `
    <h2>Welcome to Vello!</h2>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationLink}">Verify my email</a>
    <p>If you did not sign up for a Vello account, please ignore this email.</p>
  `

  await sendMail(getUser.email, customSubject, htmlContent)
  // Return Data to Controller
  return pickUser(getUser)

 } catch (error) {
    throw error
 }
}

const verify = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Check valid request
    if(!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    if(existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    }
    if(existUser.verifyToken !== reqBody.token) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid Token!')
    }

    // Update User Profile to verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    // Save data to the database
    const updatedUser = await userModel.update(existUser._id, updateData)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Check valid request
    if(!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    if(!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active - Check your email to active account!')
    }
    if(!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Email or Password is incorrect!')
    }
    // if valid is ok, create Tokens to login to return for FE

    const userInfo ={
      _id: existUser._id,
      email: existUser.email
    }

    // Create 2 type token, accessToken and refreshToken to return for FE

    // Access Token to verify user
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    
    // Refresh Token to refresh Access Token
    const refreshToken = await jwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 20
      env.REFRESH_TOKEN_LIFE
    )
    // Information will intergrate in JWT Token include: _id, email of user
    // Return infot of user with 2 token above.
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    //  01: Verify refreshToken
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    // Get userInfo from refreshToken
    const userInfo = { _id: refreshTokenDecoded._id, email: refreshTokenDecoded.email }

    // Create new accessToken
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) { throw error }
}
const update = async (userId, reqBody, userAvatarFile) =>{
  try {
    // Query User and check if user is active
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

      // Init data to update
    let updatedUser = {
    }
    // Case 1: Change password
    if(reqBody.current_password && reqBody.new_password) {
        // CHECK CurrentPassword is correct
      if(!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Current Password is incorrect!')
      }
      // if CurrentPassword is correct, hash new password and update to DB
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 10)
      })

    }
    // Update avatar
    else if (userAvatarFile){
      // Upload image to Cloudinary
      const cloudinaryResponse = await cloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      // Update avatar to DB
      updatedUser = await userModel.update(existUser._id, {
        avatar: cloudinaryResponse.secure_url
      })
    }
    // Update displayname
    else{
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verify,
  login,
  refreshToken,
  update
}