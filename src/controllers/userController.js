import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ApiError from "../utils/ApiError";
import ms from 'ms'

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}

const verify = async (req, res, next) => {
  try {
    const result = await userService.verify(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    // handle http only cookie for browser
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('7 days') // ms is a library to convert time to milliseconds
    })  

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('7 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
const logout = async (req, res, next) => {
  try {
    // Delete cookie - reverse of setting cookie in login function
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)

    // return new cookie accessToken  after refresh successfully
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('7 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Login!'))
  }
}
const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const userAvatarFile = req.file
    const updatedUser = await userService.update(userId, req.body, userAvatarFile )
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) { next(error) }
}

export const userController = {
  createNew,
  verify,
  login,
  logout,
  refreshToken,
  update
}
