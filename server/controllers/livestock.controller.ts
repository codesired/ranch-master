import { Router } from 'express';
import { BaseController, requireAuth, validateBody } from './base.controller';
import { storage } from '../storage';
import { authenticateFirebaseToken } from '../firebaseAuth';
import {
  insertAnimalSchema,
  insertHealthRecordSchema,
  insertBreedingRecordSchema,
} from '@shared/schema';

class LivestockController extends BaseController {
  // Get all animals for user
  getAnimals = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getAnimals(userId);
    });
  });

  // Get single animal
  getAnimal = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      const animal = await storage.getAnimal(id, userId);
      if (!animal) {
        throw new Error('Not Found');
      }
      return animal;
    });
  });

  // Create new animal
  createAnimal = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const animalData = insertAnimalSchema.parse({ ...req.body, userId });
      return await storage.createAnimal(animalData);
    }, 201);
  });

  // Update animal
  updateAnimal = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      const animalData = insertAnimalSchema.partial().parse(req.body);
      return await storage.updateAnimal(id, animalData, userId);
    });
  });

  // Delete animal
  deleteAnimal = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      await storage.deleteAnimal(id, userId);
      return null;
    }, 204);
  });

  // Get health records for animal
  getHealthRecords = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const animalId = this.parseId(req.params.animalId);
      return await storage.getHealthRecords(animalId, userId);
    });
  });

  // Create health record
  createHealthRecord = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const recordData = insertHealthRecordSchema.parse({ ...req.body, userId });
      return await storage.createHealthRecord(recordData);
    }, 201);
  });

  // Get breeding records
  getBreedingRecords = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getBreedingRecords(userId);
    });
  });

  // Create breeding record
  createBreedingRecord = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const recordData = insertBreedingRecordSchema.parse({ ...req.body, userId });
      return await storage.createBreedingRecord(recordData);
    }, 201);
  });
}

// Create router and register routes
export function createLivestockRoutes(): Router {
  const router = Router();
  const controller = new LivestockController();

  // Apply Firebase authentication to all routes
  router.use(authenticateFirebaseToken);

  // Animal routes
  router.get('/animals', controller.getAnimals);
  router.get('/animals/:id', controller.getAnimal);
  router.post('/animals', controller.createAnimal);
  router.put('/animals/:id', controller.updateAnimal);
  router.delete('/animals/:id', controller.deleteAnimal);

  // Health record routes
  router.get('/animals/:animalId/health-records', controller.getHealthRecords);
  router.post('/health-records', controller.createHealthRecord);

  // Breeding record routes
  router.get('/breeding-records', controller.getBreedingRecords);
  router.post('/breeding-records', controller.createBreedingRecord);

  return router;
}