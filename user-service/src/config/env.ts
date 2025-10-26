import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from project root (go up 2 levels from src/config/)
const envPath = resolve(__dirname, '../../.env')
console.log('Loading .env from:', envPath)
dotenv.config({ path: envPath })

interface Environment {
  PORT: number
  NODE_ENV: 'development' | 'production' | 'test'
  MONGO_URI: string
  JWT_SECRET: string
  JWT_EXPIRE: string
  EMAIL_HOST: string
  EMAIL_PORT: number
  EMAIL_USER: string
  EMAIL_PASSWORD: string
  EMAIL_FROM: string
  FRONTEND_URL: string
  ALLOWED_ORIGINS: string[]
}

function validateEnv(): Environment {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
    'FRONTEND_URL',
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }

  return {
    PORT: parseInt(process.env.PORT || '4001', 10),
    NODE_ENV:
      (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
    MONGO_URI: process.env.MONGO_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRE: process.env.JWT_EXPIRE!,
    EMAIL_HOST: process.env.EMAIL_HOST!,
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
    EMAIL_USER: process.env.EMAIL_USER!,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD!,
    EMAIL_FROM: process.env.EMAIL_FROM!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
  }
}

export const env = validateEnv()
