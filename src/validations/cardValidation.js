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

export const cardValidation = {
  createNew
}