import express from 'express';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import exitHook from 'async-exit-hook';
import { APIs } from './routes/v1';
import cors from 'cors'
import { corsOptions} from './config/cors';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import cookieParser from 'cookie-parser';

const START_SERVER = () =>{
  const app = express();

  // Fix cache from disk to memory
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cors(corsOptions));
  // Enable cookie parser
  app.use(cookieParser());
  const hostname = 'localhost';
  const port = 8086;
  // Enable turn on req.body json data
  app.use(express.json());

  app.use('/v1',APIs);

  // Middleware to handle errors
  app.use(errorHandlingMiddleware);

  app.listen(port, hostname, () =>{
    console.log(`Server running at http://${hostname}:${port}/`)
  })

  exitHook(() => {
    console.log('Server is shutting down')
    CLOSE_DB()
      .then(() => {
        console.log('Database connection is closed')
      })
      .catch((error) => {
        console.error('Error closing the database connection', error)
      })
  })
}

// Connect to the database
CONNECT_DB()
  .then(() => {
    // Start the server
    START_SERVER() 
  })
  .catch((error) => {
    console.error('Error connecting to the database', error)
    process.exit(0)
  })

