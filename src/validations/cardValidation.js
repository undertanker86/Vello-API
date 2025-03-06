import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";

const createNew = async (req, res, next) =>{
  const correcCondition = Joi.object({
   boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
   title: Joi.string().required().min(3).max(50).trim().strict(),
   columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

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

const update = async (req, res, next) => {
  // Do not use required() function in Update case.
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().optional()
  })

  try {
    // Specify abortEarly: false to return all errors in case of multiple validation errors
    //For update case, allow Unknown to avoid pushing some fields up
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const cardValidation = {
  createNew,
  update
}