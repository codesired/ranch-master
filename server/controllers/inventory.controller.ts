import { Router } from 'express';
import { BaseController, requireAuth } from './base.controller';
import { storage } from '../storage';
import { authenticateFirebaseToken } from '../firebaseAuth';
import {
  insertInventorySchema,
  insertEquipmentSchema,
  insertMaintenanceRecordSchema,
} from '@shared/schema';

class InventoryController extends BaseController {
  // Inventory routes
  getInventory = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getInventory(userId);
    });
  });

  createInventoryItem = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const inventoryData = insertInventorySchema.parse({ ...req.body, userId });
      return await storage.createInventoryItem(inventoryData);
    }, 201);
  });

  getLowStockItems = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getLowStockItems(userId);
    });
  });

  // Equipment routes
  getEquipment = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getEquipment(userId);
    });
  });

  createEquipment = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const equipmentData = insertEquipmentSchema.parse({ ...req.body, userId });
      return await storage.createEquipment(equipmentData);
    }, 201);
  });

  updateEquipment = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      const equipmentData = insertEquipmentSchema.partial().parse(req.body);
      return await storage.updateEquipment(id, equipmentData, userId);
    });
  });

  deleteEquipment = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      await storage.deleteEquipment(id, userId);
      return null;
    }, 204);
  });

  // Maintenance record routes
  getMaintenanceRecords = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const equipmentId = this.parseId(req.params.equipmentId);
      return await storage.getMaintenanceRecords(equipmentId, userId);
    });
  });

  createMaintenanceRecord = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const recordData = insertMaintenanceRecordSchema.parse({ ...req.body, userId });
      return await storage.createMaintenanceRecord(recordData);
    }, 201);
  });
}

// Create router and register routes
export function createInventoryRoutes(): Router {
  const router = Router();
  const controller = new InventoryController();

  // Apply Firebase authentication to all routes
  router.use(authenticateFirebaseToken);

  // Inventory routes
  router.get('/inventory', controller.getInventory);
  router.post('/inventory', controller.createInventoryItem);
  router.get('/inventory/low-stock', controller.getLowStockItems);

  // Equipment routes
  router.get('/equipment', controller.getEquipment);
  router.post('/equipment', controller.createEquipment);
  router.put('/equipment/:id', controller.updateEquipment);
  router.delete('/equipment/:id', controller.deleteEquipment);

  // Maintenance record routes
  router.get('/equipment/:equipmentId/maintenance-records', controller.getMaintenanceRecords);
  router.post('/maintenance-records', controller.createMaintenanceRecord);

  return router;
}