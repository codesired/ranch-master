
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { config, isProduction } from "./config";
import { securityHeaders, createRateLimiter, validateRequest, errorHandler } from "./middleware/security";
import { requestLogger, logger } from "./middleware/logging";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Trust proxy in production
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(securityHeaders);
app.use(createRateLimiter());
app.use(validateRequest);

// CORS configuration
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware for production
if (isProduction) {
  app.use(compression());
}

// Logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
registerRoutes(app);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(config.port, '0.0.0.0', async () => {
  const mode = isProduction ? 'production' : 'development';
  logger.info(`Server running on port ${config.port} in ${mode} mode`);
  
  // Static file serving and Vite setup
  if (isProduction) {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
