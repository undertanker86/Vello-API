import { env } from '../config/environment'


export const WHITELIST_ORIGINS = [
  'http://localhost:3000',
]

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PROD : env.WEBSITE_DOMAIN_DEV