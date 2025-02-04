import { StatusCodes } from "http-status-codes";
import { cardService } from "../services/cardService";

const createNew = async (req, res, next) =>{
  try{
    const creatednewCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(creatednewCard)
  }
  catch (error){
    next(error)
  }
}
export const cardController = {
  createNew
}