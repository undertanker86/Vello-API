import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from "~/config/mongodb.js";
import { ObjectId } from "mongodb";


// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const validateCreateNew = async (data) => {
  try {
    return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {abortEarly: false})
  } catch (error) {
    throw new Error(error)
  }
}
const createNew = async (data) =>{
  try {
    const validData = await validateCreateNew(data)
    const newColumnCreate = {
      ...validData,
      boardId: new ObjectId(validData.boardId)
    }
    const createdColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnCreate)
    return createdColumn 
  } catch (error) {
    throw new Error(error) // throw error to catch
  }
}

const findOneById = async (boardId) =>{
  try {
    const column = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
      _id: new ObjectId(boardId)
    })
    return column
  } catch (error) {
    throw new Error(error)
  }
}
const pushCardOrderIds = async (card) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      {_id: new ObjectId(card.columnId)},
      {$push: {cardOrderIds: new ObjectId(card._id)}},
      {returnDocument: 'after'}
    )
    return result.value // findOneAndUpdate return the document after update
  } catch (error) {
    throw new Error(error)
  }
}
const updateColumn = async (columnId, updateData) => {
  try {
    Object.keys(updateData).forEach(key => {
      if(INVALID_UPDATE_FIELDS.includes(key)){
        delete updateData[key]
      }
    })
    if(updateData.cardOrderIds){
      updateData.cardOrderIds = updateData.cardOrderIds.map(_id => new ObjectId(_id))
    }
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      {_id: new ObjectId(columnId)},
      {$set: updateData},
      {returnDocument: 'after'}
    )
    return result // findOneAndUpdate return the document after update
  } catch (error) {
    throw new Error(error)
  }
}
export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  updateColumn
}