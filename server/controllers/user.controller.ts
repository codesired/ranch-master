import { Router } from 'express';
import { BaseController, requireAuth, requireAdmin } from './base.controller';
import { storage } from '../storage';
import { authenticateFirebaseToken } from '../firebaseAuth';
import {
  updateUserProfileSchema,
  insertUserNotificationSettingsSchema,
} from '@shared/schema';

class UserController extends BaseController {
  // Firebase Auth sync route
  firebaseSync = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const { uid, email, displayName, photoURL } = req.body;
      
      await storage.upsertUser({
        id: uid,
        email: email || '',
        firstName: displayName?.split(' ')[0] || '',
        lastName: displayName?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: photoURL || '',
      });

      return { success: true };
    });
  });

  // Get current user
  getCurrentUser = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getUser(userId);
    });
  });

  // Update user profile
  updateProfile = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const profileData = updateUserProfileSchema.parse(req.body);
      return await storage.updateUserProfile(userId, profileData);
    });
  });

  // Get notification settings
  getNotificationSettings = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const settings = await storage.getUserNotificationSettings(userId);
      return settings || {
        emailNotifications: true,
        healthAlerts: true,
        lowStockAlerts: true,
        weatherAlerts: true,
        maintenanceReminders: true,
      };
    });
  });

  // Update notification settings
  updateNotificationSettings = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const settingsData = insertUserNotificationSettingsSchema.parse({
        ...req.body,
        userId,
      });
      return await storage.upsertUserNotificationSettings(settingsData);
    });
  });

  // Get dashboard stats
  getDashboardStats = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getDashboardStats(userId);
    });
  });

  // Admin: Get all users
  getAllUsers = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      // Check admin role
      const userId = this.validateUser(req);
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        throw new Error('Admin access required');
      }
      return await storage.getAllUsers();
    });
  });
}

// Create router and register routes
export function createUserRoutes(): Router {
  const router = Router();
  const controller = new UserController();

  // Apply Firebase authentication to all routes
  router.use(authenticateFirebaseToken);

  // Auth routes
  router.post('/auth/firebase-sync', controller.firebaseSync);
  router.get('/auth/user', controller.getCurrentUser);

  // Profile routes
  router.patch('/profile', controller.updateProfile);

  // Notification settings routes
  router.get('/notifications/settings', controller.getNotificationSettings);
  router.patch('/notifications/settings', controller.updateNotificationSettings);

  // Dashboard routes
  router.get('/dashboard/stats', controller.getDashboardStats);

  // Admin routes
  router.get('/admin/users', controller.getAllUsers);

  return router;
}