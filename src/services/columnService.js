import { columnModel } from "../models/columnModel"
import { boardModel } from "../models/boardModel"
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

export const columnService = {
  createNew,
  updateColumn
}