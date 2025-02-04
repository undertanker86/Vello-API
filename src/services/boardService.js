import ApiError from "../utils/ApiError"
import { slugify } from "../utils/createSlug"
import { boardModel } from "../models/boardModel"
import { StatusCodes } from "http-status-codes"
import { cloneDeep, update } from "lodash"
const createNew = async (data) => {
  try {
    const newBoard ={
      ...data,
      slug: slugify(data.title)
    }
    const createdBoard = await boardModel.createNew(newBoard)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    console.log(getNewBoard)
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if(!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    const boardClone = cloneDeep(board)
    boardClone.columns.forEach(column => {
      column.cards = boardClone.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    delete boardClone.cards
    return boardClone
  } catch (error) {
    throw error
  }
}


const updateBoard = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const board = await boardModel.updateBoard(boardId, updateData)
    return board
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  updateBoard
}