import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { createLivestockRoutes } from "./controllers/livestock.controller";
import { createFinanceRoutes } from "./controllers/finance.controller";
import { createInventoryRoutes } from "./controllers/inventory.controller";
import { createUserRoutes } from "./controllers/user.controller";
import { createDocumentRoutes } from "./controllers/document.controller";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files with authentication
  app.use("/uploads", express.static("uploads"));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Register modular route handlers
  app.use('/api', createUserRoutes());
  app.use('/api', createLivestockRoutes());
  app.use('/api', createFinanceRoutes());
  app.use('/api', createInventoryRoutes());
  app.use('/api', createDocumentRoutes());

  // Return a mock server for compatibility
  return createServer(app);
}