import 'dotenv/config'

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DB_NAME: process.env.DB_NAME,
  PORT: process.env.NUMBER_PORT,
  HOSTNAME: process.env.NAME_HOST
}