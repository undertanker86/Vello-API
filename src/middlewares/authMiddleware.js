import { StatusCodes } from 'http-status-codes'
import { jwtProvider } from '../providers/JwtProvider.js'
import { env } from '../config/environment'
import ApiError from '../utils/ApiError'

// Task: authenticate the JWT accessToken received from the client

const isAuthorized = async (req, res, next) => {
// Get accessToken in request cookies from the client - withCredentials in authorizeAxios file
  const clientAccessToken = req.cookies?.accessToken

  // If the clientAccessToken does not exist, return an error immediately
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {

    // 1. to decode token to see if it is valid
    const accessTokenDecoded = await jwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )    
    // console.log(accessTokenDecoded)
    // console.log("-----------------")
    // 2. if token is valid, the decode information in req.jwtDecoded, to use for next handle
    req.jwtDecoded = accessTokenDecoded
    // 3. accept request to next handle
    next()
  } catch (error) {
    console.error('JWT Verification Error:', error)
    // if accessToken is expired, return an error immediately (410), so FE to know and call api refreshToken
    if(error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Token expired-need to refresh token!'))
      return
    }
    // if accessToken is invalid to return 401 error, so FE call api sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token invalid)'))
  }
}

export const authMiddleware = { isAuthorized }