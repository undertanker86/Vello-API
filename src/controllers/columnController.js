import { StatusCodes } from "http-status-codes";
import { columnService } from "../services/columnService";

const createNew = async (req, res, next) =>{
  try{
    const creatednewColumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(creatednewColumn)
  }
  catch (error){
    next(error)
  }
}
export const columnController = {
  createNew
}