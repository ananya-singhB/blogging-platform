interface Environment {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  ALLOWED_ORIGINS: string[];
}

function validateEnv(): Environment {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRE'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
    MONGO_URI: process.env.MONGO_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRE: process.env.JWT_EXPIRE!,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  };
}

export const env = validateEnv();
