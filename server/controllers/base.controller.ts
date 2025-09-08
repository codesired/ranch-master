import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Base controller class with common functionality
export abstract class BaseController {
  protected async handleRequest<T>(
    req: Request,
    res: Response,
    handler: () => Promise<T>,
    successStatus: number = 200
  ): Promise<void> {
    try {
      const result = await handler();
      res.status(successStatus).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  protected handleError(error: any, res: Response): void {
    console.error('Controller error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.errors
      });
    }

    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (error.message === 'Not Found') {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }

  protected validateUser(req: any): string {
    if (!req.user?.uid) {
      throw new Error('Unauthorized');
    }
    return req.user.uid;
  }

  protected parseId(id: string): number {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new Error('Invalid ID format');
    }
    return parsed;
  }
}

// Authentication middleware wrapper
export const requireAuth = (handler: (req: any, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      await handler(req, res, next);
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Validation middleware
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// Admin authorization middleware
export const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Import storage here to avoid circular dependencies
    const { storage } = await import('../storage');
    const user = await storage.getUser(req.user.uid);
    
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};