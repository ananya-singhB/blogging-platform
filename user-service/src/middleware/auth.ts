import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js'; 

interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        message: 'No token provided. Authorization denied.' 
      });
      return;
    }

    const parts = authHeader.split(' ');
    const token = parts[1];
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Malformed authorization header.'
      });
      return;
    }
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;
    
    if (!decoded.userId || !decoded.email) {
      res.status(401).json({
        success: false,
        message: 'Invalid token structure.'
      });
      return;
    }
    
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
      return;
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token. Authorization denied.' 
    });
  }
};

export default authMiddleware;
