import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb.js";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";
import { columnModel } from "./columnModel";
import { cardModel } from "./cardModel";
import { pagingSkipValue } from "../utils/algorithms";

// Define Colecction Schema
const BOARD_COLLECTION_NAME = "boards";
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(300).trim().strict(),
  type: Joi.string().valid('public', 'private').required(),
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // Admins board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),  
  // Members board
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),    
  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})



const validateCreateNew = async (data) => {
  try {
    return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {abortEarly: false})
  } catch (error) {
    throw new Error(error)
  }
}
const createNew = async (userId, data) =>{
  try {
    const validData = await validateCreateNew(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    return createdBoard 
  } catch (error) {
    throw new Error(error) // throw error to catch
  }
}

const getDetails = async (userId, boardId) =>{
  try {
    const queryConditions = [
      { _id: new ObjectId(boardId)},
      { _deleted: false },
    { $or: [
      { ownerIds: { $all: [new ObjectId(userId)] } },
      { memberIds: { $all: [new ObjectId(userId)] }
      }
    ] }      
    ]
    // console.log("ID: ",id)
    const board = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      {
        $lookup: { 
        from: cardModel.CARD_COLLECTION_NAME, 
        localField: '_id', 
        foreignField: 'boardId',
        as: 'cards' 
      },
    }
    ]).toArray() // Convert to array
    // console.log("Board123: ",board[0])
    return board[0] || null // return first element or null

  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (boardId) =>{
  try {
    const board = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(boardId)
    })
    return board
  } catch (error) {
    throw new Error(error)
  }
}
// Push columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {_id: new ObjectId(column.boardId)},
      {$push: {columnOrderIds: new ObjectId(column._id)}},
      {returnDocument: 'after'}
    )
    return result // findOneAndUpdate return the document after update
  } catch (error) {
    throw new Error(error)
  }
}

const updateBoard = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach(key => {
      if(INVALID_UPDATE_FIELDS.includes(key)){
        delete updateData[key]
      }
    })
    if(updateData.columnOrderIds){
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => new ObjectId(_id))
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {_id: new ObjectId(boardId)},
      {$set: updateData},
      {returnDocument: 'after'}
    )
    return result // findOneAndUpdate return the document after update
  } catch (error) {
    throw new Error(error)
  }
}


const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {_id: new ObjectId(column.boardId)},
      {$pull: {columnOrderIds: new ObjectId(column._id)}}, // get element to out OrderIds
      {returnDocument: 'after'}
    )
    return result // findOneAndUpdate return the document after update
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
      const queryConditions = [
        // Condition 1: Board not deleted
        { _deleted: false },
              // Condition 2: UserId do request must in owerIds or memberIds, use $all from mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] }
        }
      ] }      
      ]

      const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
        { $match: { $and: queryConditions } },
        { $sort: { title: 1 } }, // sort a-z (title)
        { $facet: {
          // T1: QUERY BOARDS
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage)}, // Skip quantity item return in previos pages.
            { $limit: itemsPerPage }, // Limit quantity item return in 1 page.
          ],
          // T2: COUNT TOTAL BOARDS
          'queryTotalBoards': [
            { $count: 'totalBoards' }
          ],
        }}, // Handle multiple query
      ], {collation: {locale: 'en'}}).toArray() // Convert to array

    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.totalBoards || 0
    }
  } catch (error) { throw error }
}
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  updateBoard,
  pullColumnOrderIds,
  getBoards
}

