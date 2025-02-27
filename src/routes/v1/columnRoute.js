import express from 'express';
import { columnValidation } from '~/validations/columnValidation';
import { columnController } from '~/controllers/columnController';
import { authMiddleware } from '../../middlewares/authMiddleware';



const Router = express.Router();

Router.route('/')
  .post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)
Router.route('/:id')
  .put(authMiddleware.isAuthorized, columnValidation.updateColumn, columnController.updateColumn)
  .delete(authMiddleware.isAuthorized, columnValidation.deleteColumn, columnController.deleteColumn)
  export const columnRoutes = Router;