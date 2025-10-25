import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration using validated env
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (env.ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    success: true,
    service: 'User Service',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: env.NODE_ENV === 'development' ? err : undefined
  });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 User Service running on port ${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
});
