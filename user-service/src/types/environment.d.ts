declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV: 'development' | 'production' | 'test';
      MONGO_URI: string;
      JWT_SECRET: string;
      JWT_EXPIRE: string;
      ALLOWED_ORIGINS: string;
    }
  }
}

export {};
