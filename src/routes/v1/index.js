import express from 'express';
import { boardRoutes } from './boardRoute';
import { columnRoutes } from './columnRoute';
import { cardRoutes } from './cardRoute';
import { userRoutes } from './userRoute';
const Router = express.Router();

Router.get('/status', (req, res) => {
  res.send('Hello World');
});

Router.use('/boards', boardRoutes);
Router.use('/columns', columnRoutes);
Router.use('/cards', cardRoutes);
Router.use('/users', userRoutes);

export const APIs = Router;