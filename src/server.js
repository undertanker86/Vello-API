import express from 'express';
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb';
import exitHook from 'async-exit-hook';
import { env } from '~/config/environment';


const START_SERVER = () =>{
  const app = express();

  const hostname = 'localhost';
  const port = 8086;

  app.get('/', function (req, res) {
    res.send('Hello World')
  })

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

