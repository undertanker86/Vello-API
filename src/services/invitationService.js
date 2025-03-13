import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Inviter: is the person who is requesting, so we search by id taken from token
    const inviter = await userModel.findOneById(inviterId)
    // Invited person: taken from email received from FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Find the board to get data to process.
    const board = await boardModel.findOneById(reqBody.boardId)
    // If none of the 3 exist, just reject them.
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Create the necessary data to save into the DB
    // You can try to remove or distort type, boardInvitation, status to test if Model validate ok.
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // Convert from Object to String because on the Model side, there is a data check in the create function.
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING // Default initial status will be Pending
      }
    }

    // Call to Model to save to DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    // In addition to the information of the newly created board invitation, it also returns the board, inviter, and invitee for FE to comfortably process.
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) { throw error }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)

    const resInvitations = getInvitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {}, 
      board: i.board[0] || {}
    }))

    return resInvitations
  } catch (error) { throw error }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // Find invitation record in model
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

    // After getting getInvitation, get full information of the board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    // Check if the status is ACCEPTED join board and the user (invitee) is already the owner or member of the board, then return an error message. 
    // Note: The 2 arrays memberIds and ownerIds of the board are of ObjectId data type, so return them all to String to check
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board.')
    }

    // Create data to update Invitation record
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status // status is ACCEPTED or REJECTED sent by FE
      }
    }

    // Step 1: Update status in Invitation record
    const updatedInvitation = await invitationModel.update(invitationId, updateData)

   // Step 2: If the Accept invitation is successful, the user's information (userId) needs to be added to the memberIds record in the collection board.
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) { throw error }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
