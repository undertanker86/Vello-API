import express from 'express';
import { boardValidation } from '~/validations/boardValidation';
import { boardController } from '~/controllers/boardController';
import { authMiddleware } from '../../middlewares/authMiddleware';
const Router = express.Router();

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)


Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.updateBoard, boardController.updateBoard)

Router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardDifferentColumn, boardController.moveCardDifferentColumn)
export const boardRoutes = Router;