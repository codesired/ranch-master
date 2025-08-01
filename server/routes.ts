import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateFirebaseToken, type AuthenticatedRequest } from "./firebaseAuth";
import { seedDatabase } from "./seed-data";
import {
  insertAnimalSchema,
  insertHealthRecordSchema,
  insertBreedingRecordSchema,
  insertTransactionSchema,
  insertInventorySchema,
  insertEquipmentSchema,
  insertMaintenanceRecordSchema,
  insertDocumentSchema,
  insertBudgetSchema,
  insertAccountSchema,
  insertJournalEntrySchema,
  insertUserNotificationSettingsSchema,
  updateUserProfileSchema,
  type UpdateUserProfile,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = "uploads";
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory already exists or error creating it
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow specific file types
    const allowedTypes = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png|txt|csv/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files with authentication
  app.use("/uploads", authenticateFirebaseToken, (req: any, res, next) => {
    // Add security headers for file downloads
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });

  // Static file serving for uploads
  app.use("/uploads", express.static("uploads"));

  // Firebase Auth sync route
  app.post("/api/auth/firebase-sync", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { uid, email, displayName, photoURL } = req.body;
      
      // Upsert user in database
      await storage.upsertUser({
        id: uid,
        email: email || '',
        firstName: displayName?.split(' ')[0] || '',
        lastName: displayName?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: photoURL || '',
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error syncing Firebase user:", error);
      res.status(500).json({ message: "Failed to sync user" });
    }
  });

  // Auth routes
  app.get("/api/auth/user", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.uid);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.patch("/api/profile", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const profileData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Notification settings routes
  app.get(
    "/api/notifications/settings",
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const userId = req.user.uid;
        const settings = await storage.getUserNotificationSettings(userId);
        res.json(
          settings || {
            emailNotifications: true,
            healthAlerts: true,
            lowStockAlerts: true,
            weatherAlerts: true,
            maintenanceReminders: true,
          },
        );
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch notification settings" });
      }
    },
  );

  app.patch(
    "/api/notifications/settings",
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const userId = req.user.uid;
        const settingsData = insertUserNotificationSettingsSchema.parse({
          ...req.body,
          userId,
        });
        const settings =
          await storage.upsertUserNotificationSettings(settingsData);
        res.json(settings);
      } catch (error) {
        console.error("Error updating notification settings:", error);
        res
          .status(500)
          .json({ message: "Failed to update notification settings" });
      }
    },
  );

  // Dashboard routes
  app.get("/api/dashboard/stats", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Animal routes
  app.get("/api/animals", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const animals = await storage.getAnimals(userId);
      res.json(animals);
    } catch (error) {
      console.error("Error fetching animals:", error);
      res.status(500).json({ message: "Failed to fetch animals" });
    }
  });

  app.get("/api/animals/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      const animal = await storage.getAnimal(id, userId);
      if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
      }
      res.json(animal);
    } catch (error) {
      console.error("Error fetching animal:", error);
      res.status(500).json({ message: "Failed to fetch animal" });
    }
  });

  app.post("/api/animals", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log("Hello Word");
      const userId = req.user.uid;
      const animalData = insertAnimalSchema.parse({ ...req.body, userId });
      const animal = await storage.createAnimal(animalData);
      res.status(201).json(animal);
    } catch (error) {
      console.error("Error creating animal:", error);
      res.status(500).json({ message: "Failed to create animal" });
    }
  });

  app.put("/api/animals/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      const animalData = insertAnimalSchema.partial().parse(req.body);
      const animal = await storage.updateAnimal(id, animalData, userId);
      res.json(animal);
    } catch (error) {
      console.error("Error updating animal:", error);
      res.status(500).json({ message: "Failed to update animal" });
    }
  });

  app.delete("/api/animals/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      await storage.deleteAnimal(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting animal:", error);
      res.status(500).json({ message: "Failed to delete animal" });
    }
  });

  // Health records routes
  app.get(
    "/api/animals/:animalId/health-records",
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const userId = req.user.uid;
        const animalId = parseInt(req.params.animalId);
        const records = await storage.getHealthRecords(animalId, userId);
        res.json(records);
      } catch (error) {
        console.error("Error fetching health records:", error);
        res.status(500).json({ message: "Failed to fetch health records" });
      }
    },
  );

  app.post("/api/health-records", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const recordData = insertHealthRecordSchema.parse({
        ...req.body,
        userId,
      });
      const record = await storage.createHealthRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating health record:", error);
      res.status(500).json({ message: "Failed to create health record" });
    }
  });

  // Breeding records routes
  app.get("/api/breeding-records", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const records = await storage.getBreedingRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching breeding records:", error);
      res.status(500).json({ message: "Failed to fetch breeding records" });
    }
  });

  app.post("/api/breeding-records", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const recordData = insertBreedingRecordSchema.parse({
        ...req.body,
        userId,
      });
      const record = await storage.createBreedingRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating breeding record:", error);
      res.status(500).json({ message: "Failed to create breeding record" });
    }
  });

  app.get("/api/financial-summary", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const summary = await storage.getFinancialSummary(userId, start, end);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const inventory = await storage.getInventory(userId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const inventoryData = insertInventorySchema.parse({
        ...req.body,
        userId,
      });
      const item = await storage.createInventoryItem(inventoryData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.get("/api/inventory/low-stock", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const lowStockItems = await storage.getLowStockItems(userId);
      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  // Equipment routes
  app.get("/api/equipment", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const equipment = await storage.getEquipment(userId);
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const equipmentData = insertEquipmentSchema.parse({
        ...req.body,
        userId,
      });
      const equipment = await storage.createEquipment(equipmentData);
      res.status(201).json(equipment);
    } catch (error) {
      console.error("Error creating equipment:", error);
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });

  app.put("/api/equipment/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      const equipmentData = insertEquipmentSchema.partial().parse(req.body);
      const equipment = await storage.updateEquipment(id, equipmentData, userId);
      res.json(equipment);
    } catch (error) {
      console.error("Error updating equipment:", error);
      res.status(500).json({ message: "Failed to update equipment" });
    }
  });

  app.delete("/api/equipment/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      await storage.deleteEquipment(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      res.status(500).json({ message: "Failed to delete equipment" });
    }
  });

  // Maintenance records routes
  app.get(
    "/api/equipment/:equipmentId/maintenance-records",
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const userId = req.user.uid;
        const equipmentId = parseInt(req.params.equipmentId);
        const records = await storage.getMaintenanceRecords(equipmentId, userId);
        res.json(records);
      } catch (error) {
        console.error("Error fetching maintenance records:", error);
        res.status(500).json({ message: "Failed to fetch maintenance records" });
      }
    },
  );

  app.post("/api/maintenance-records", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const recordData = insertMaintenanceRecordSchema.parse({
        ...req.body,
        userId,
      });
      const record = await storage.createMaintenanceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating maintenance record:", error);
      res.status(500).json({ message: "Failed to create maintenance record" });
    }
  });

  // Document routes
  app.get("/api/documents", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/stats", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const documents = await storage.getDocuments(userId);

      const totalDocuments = documents.length;
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const recentUploads = documents.filter(
        (doc: any) => new Date(doc.createdAt) > oneWeekAgo,
      ).length;

      const expiringSoon = documents.filter(
        (doc: any) =>
          doc.expiryDate && new Date(doc.expiryDate) <= thirtyDaysFromNow,
      ).length;

      const categories = new Set(documents.map((doc: any) => doc.category));
      const categoriesCount = categories.size;

      // Mock storage usage for now
      const storageUsed = Math.min(Math.round((totalDocuments / 1000) * 100), 100);

      res.json({
        totalDocuments,
        recentUploads,
        expiringSoon,
        storageUsed,
        categoriesCount,
      });
    } catch (error) {
      console.error("Error fetching document stats:", error);
      // Return default stats if there's an error
      res.json({
        totalDocuments: 0,
        recentUploads: 0,
        expiringSoon: 0,
        storageUsed: 0,
        categoriesCount: 0,
      });
    }
  });

  app.post(
    "/api/documents",
    authenticateFirebaseToken,
    upload.single("file"),
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const userId = req.user.uid;

        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Parse tags if provided
        const tags = req.body.tags
          ? req.body.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : [];

        const documentData = {
          userId,
          title: req.body.title,
          category: req.body.category,
          description: req.body.description || "",
          fileUrl: `/uploads/${req.file.filename}`,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          tags,
          isPublic: req.body.isPublic === "true",
          expiryDate: req.body.expiryDate || null,
          relatedEntityType: req.body.relatedEntityType || null,
          relatedEntityId: req.body.relatedEntityId
            ? parseInt(req.body.relatedEntityId)
            : null,
        };

        const validatedData = insertDocumentSchema.parse(documentData);
        const document = await storage.createDocument(validatedData);
        res.status(201).json(document);
      } catch (error) {
        console.error("Error creating document:", error);
        // Clean up uploaded file if document creation fails
        if (req.file) {
          try {
            await fs.unlink(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting uploaded file:", unlinkError);
          }
        }
        res.status(500).json({ message: "Failed to create document" });
      }
    },
  );

  app.put("/api/documents/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      const documentData = insertDocumentSchema.partial().parse(req.body);
      const document = await storage.updateDocument(id, documentData, userId);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Weather route (example using OpenWeatherMap API)
  app.get("/api/weather", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "demo_key";
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`,
      );

      if (!response.ok) {
        return res.status(response.status).json({ message: "Weather service unavailable" });
      }

      const weatherData = await response.json();
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Budget routes
  app.get("/api/budgets", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const budgets = await storage.getBudgets(userId);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const budgetData = insertBudgetSchema.parse({ ...req.body, userId });
      const budget = await storage.createBudget(budgetData);
      res.status(201).json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.put("/api/budgets/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      const budgetData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, budgetData, userId);
      res.json(budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      await storage.deleteBudget(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  app.get("/api/budget-status", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const { period } = req.query;
      const status = await storage.getBudgetStatus(userId, period as string);
      res.json(status);
    } catch (error) {
      console.error("Error fetching budget status:", error);
      res.status(500).json({ message: "Failed to fetch budget status" });
    }
  });

  // Account routes
  app.get("/api/accounts", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const accounts = await storage.getAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const accountData = insertAccountSchema.parse({ ...req.body, userId });
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.put("/api/accounts/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      const accountData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, accountData, userId);
      res.json(account);
    } catch (error) {
      console.error("Error updating account:", error);
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  // Journal entry routes
  app.get("/api/journal-entries", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal-entries", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const entryData = insertJournalEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createJournalEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.get("/api/trial-balance", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const trialBalance = await storage.getTrialBalance(userId);
      res.json(trialBalance);
    } catch (error) {
      console.error("Error fetching trial balance:", error);
      res.status(500).json({ message: "Failed to fetch trial balance" });
    }
  });

  // Enhanced transaction route to include updating transaction
  app.put("/api/transactions/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, transactionData, userId);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.uid;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId,
      });
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.uid);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/stats", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.uid);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/audit-logs", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.uid);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.post("/api/admin/users", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.uid);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const newUser = await storage.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:userId/role", authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.uid);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const updatedUser = await storage.updateUserRole(req.params.userId, req.body.role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Create HTTP server and return it
  const server = createServer(app);
  return server;
}