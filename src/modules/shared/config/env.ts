import dotenv from 'dotenv'  
import path from 'path'  
  
const isProd = process.env['NODE_ENV'] === 'production'  
const envFile = isProd ? '.env' : '.env.dev'  
const envPath = path.join(process.cwd(), 'env', envFile)  
  
dotenv.config({ path: envPath })