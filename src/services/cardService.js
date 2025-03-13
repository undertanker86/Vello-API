import { cardModel } from "../models/cardModel"
import { columnModel } from "../models/columnModel"
import { cloudinaryProvider } from '../providers/cloudinaryProvider.js'

const createNew = async (data) => {
  try {
    const newCard ={
      ...data
    }
    const createdCard = await  cardModel.createNew(newCard)
    const getNewCard = await  cardModel.findOneById(createdCard.insertedId)
    if(getNewCard){
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await cloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.updateCard(cardId, { cover: uploadResult.secure_url })
    } else if (updateData.commentToAdd) {
  
      // Create comment data to add to the Database, need to add necessary fields
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      // In case of ADD or REMOVE member from Card
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else {
      // Common update cases such as title, description
      updatedCard = await cardModel.updateCard(cardId, updateData)
    }


    return updatedCard
  } catch (error) { throw error }
}


export const cardService = {
  createNew,
  update
}