/**
  Code Here
 */
  import { MongoClient, ServerApiVersion } from 'mongodb'
  import { env } from '~/config/environment'

  const MONGODB_URI = env.MONGODB_URI
  const DB_NAME = env.DB_NAME

  let velloDatabaseInstance = null // Not connect database yet

  // Initialize the MongoDB client to connect to the database
  const clientInstance = new MongoClient(MONGODB_URI, {
    // Set the serverApi to the version we want to use
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  })

  // Function to connect to the database
  export const CONNECT_DB = async () => {
    // Call the connect to MongoDB Atlas with the client instance
    await clientInstance.connect()
    // Set the database instance to the client instance
    velloDatabaseInstance = clientInstance.db(DB_NAME)
  }

  // Function to get the database instance
  export const GET_DB = () => {
    if (!velloDatabaseInstance) {
      throw new Error('Database is not connected!')
    }
    return velloDatabaseInstance
  }

  // Function to close the database connection
  export const CLOSE_DB = async () => {
    await clientInstance.close()
  }