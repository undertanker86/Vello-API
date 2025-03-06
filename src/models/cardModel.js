import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from "~/config/mongodb.js";
import { ObjectId } from "mongodb";

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),

  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  
  // embed Card comments data into the Card record as below.
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // Note here because using the $push function to add comments, do not set default Date.now to always be the same as the insertOne function when created.
    commentedAt: Joi.date().timestamp()
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})
const validateCreateNew = async (data) => {
  try {
    return await CARD_COLLECTION_SCHEMA.validateAsync(data, {abortEarly: false})
  } catch (error) {
    throw new Error(error)
  }
}
const createNew = async (data) =>{
  try {
    const validData = await validateCreateNew(data)
    const newCardCreate = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId)
    }
    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardCreate)
    return createdCard 
  } catch (error) {
    throw new Error(error) // throw error to catch
  }
}

const findOneById = async (cardId) =>{
  try {
    const card = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(cardId)
    })
    return card
  } catch (error) {
    throw new Error(error)
  }
}

const updateCard = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach(key => {
      if(INVALID_UPDATE_FIELDS.includes(key)){
        delete updateData[key]
      }
    })

    if(updateData.columnId){
      updateData.columnId = new ObjectId(updateData.columnId)
    }
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      {_id: new ObjectId(cardId)},
      {$set: updateData},
      {returnDocument: 'after'}
    )
    return result // findOneAndUpdate return the document after update
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) =>{
  try {
    const card = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
      columnId: new ObjectId(columnId)
    })
    return card
  } catch (error) {
    throw new Error(error)
  }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  updateCard,
  deleteManyByColumnId
}