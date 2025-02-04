import express from 'express';
import { boardRoutes } from './boardRoute';
import { columnRoutes } from './columnRoute';
import { cardRoutes } from './cardRoute';

const Router = express.Router();

Router.get('/status', (req, res) => {
  res.send('Hello World');
});
Router.use('/boards', boardRoutes);
Router.use('/columns', columnRoutes);
Router.use('/cards', cardRoutes);

export const APIs = Router;