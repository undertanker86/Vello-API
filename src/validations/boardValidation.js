import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";

const createNew = async (req, res, next) =>{
  const correcCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(300).trim().strict(),
    type: Joi.string().valid('public', 'private').required()
  })
  try{
    // console.log(req.body)
    await correcCondition.validateAsync(req.body, {abortEarly: false}) // abortEarly: false => return all error
    next()
    // res.status(StatusCodes.CREATED).send('Hello World')
  }
  catch(error){
    const errorMessages = new Error(error).message
    const customeError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessages) 
    next(customeError)
  }

}

const updateBoard = async (req, res, next) =>{
  const correcCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(300).trim().strict(),
    type: Joi.string().valid('public', 'private')
  })
  // Not require for case UPDATE
  try{
    // console.log(req.body)
    await correcCondition.validateAsync(req.body, {abortEarly: false, allowUnknown: true}) // abortEarly: false => return all error
    // Allow unknown: true => allow other field not in schema
    next()
    // res.status(StatusCodes.CREATED).send('Hello World')
  }
  catch(error){
    const errorMessages = new Error(error).message
    const customeError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessages) 
    next(customeError)
  }

}

const moveCardDifferentColumn = async (req, res, next) =>{
  const correcCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    sourceColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    // sourceCardOrderIds: Joi.array().required.items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
    targetColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    // targetCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
  })
  // Not require for case UPDATE
  try{
    // console.log(req.body)
    await correcCondition.validateAsync(req.body, {abortEarly: false, allowUnknown: true}) // abortEarly: false => return all error
    // Allow unknown: true => allow other field not in schema
    next()
    // res.status(StatusCodes.CREATED).send('Hello World')
  }
  catch(error){
    const errorMessages = new Error(error).message
    const customeError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessages) 
    next(customeError)
  }

}

export const boardValidation = {
  createNew,
  updateBoard,
  moveCardDifferentColumn
}