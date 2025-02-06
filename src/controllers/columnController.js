import { StatusCodes } from "http-status-codes";
import { columnService } from "../services/columnService";

const createNew = async (req, res, next) =>{
  try{
    console.log("Column information of controller: ", req.body)
    const creatednewColumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(creatednewColumn)
  }
  catch (error){
    next(error)
  }
}

const updateColumn = async (req, res, next) =>{
  try{
    const columnId = req.params.id
    const column = await columnService.updateColumn(columnId, req.body)
    res.status(StatusCodes.OK).json(column)
  }
  catch (error){
    next(error)
  }
}
export const columnController = {
  createNew,
  updateColumn
}