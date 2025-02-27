import { columnModel } from "../models/columnModel"
import { boardModel } from "../models/boardModel"
import { cardModel } from "../models/cardModel"
import ApiError from "../utils/ApiError"
import { StatusCodes } from "http-status-codes"
const createNew = async (data) => {
  try {
    console.log("Column information of services: ", data)

    const newColumn ={
      ...data
    }
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    if(getNewColumn){
      getNewColumn.cards = []
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) {
    throw error
  }
}

const updateColumn = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const column = await columnModel.updateColumn(columnId, updateData)
    return column
  } catch (error) {
    throw error
  }
}

const deleteColumn = async (columnId) => {
  try {

    // Delete ColumnId in ColumnOrderIds
    const column = await columnModel.findOneById(columnId)
    if(!column){
      throw new ApiError(StatusCodes.NOT_FOUND,"Column not found")
    }
    // console.log("Column: ",column)
    await boardModel.pullColumnOrderIds(column)
    // Delete Column
    await columnModel.deleteOneById(columnId)
    // Delete all cards in column
    await cardModel.deleteManyByColumnId(columnId)
    // return message
    return {deleteColumn: "Delete column successfully"}
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  updateColumn,
  deleteColumn
}