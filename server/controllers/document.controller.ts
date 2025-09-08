import { Router } from 'express';
import { BaseController, requireAuth } from './base.controller';
import { storage } from '../storage';
import { authenticateFirebaseToken } from '../firebaseAuth';
import { insertDocumentSchema } from '@shared/schema';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

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

class DocumentController extends BaseController {
  // Get all documents
  getDocuments = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getDocuments(userId);
    });
  });

  // Get document statistics
  getDocumentStats = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
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

      return {
        totalDocuments,
        recentUploads,
        expiringSoon,
        storageUsed,
        categoriesCount,
      };
    });
  });

  // Create document with file upload
  createDocument = requireAuth(async (req: any, res) => {
    try {
      const userId = this.validateUser(req);

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
      this.handleError(error, res);
    }
  });

  // Update document
  updateDocument = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      const documentData = insertDocumentSchema.partial().parse(req.body);
      return await storage.updateDocument(id, documentData, userId);
    });
  });

  // Delete document
  deleteDocument = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      await storage.deleteDocument(id, userId);
      return null;
    }, 204);
  });

  // Get weather data
  getWeather = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "demo_key";
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        throw new Error("Latitude and longitude are required");
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`,
      );

      if (!response.ok) {
        throw new Error("Weather service unavailable");
      }

      return await response.json();
    });
  });
}

// Create router and register routes
export function createDocumentRoutes(): Router {
  const router = Router();
  const controller = new DocumentController();

  // Apply Firebase authentication to all routes
  router.use(authenticateFirebaseToken);

  // Document routes
  router.get('/documents', controller.getDocuments);
  router.get('/documents/stats', controller.getDocumentStats);
  router.post('/documents', upload.single("file"), controller.createDocument);
  router.put('/documents/:id', controller.updateDocument);
  router.delete('/documents/:id', controller.deleteDocument);

  // Weather route
  router.get('/weather', controller.getWeather);

  return router;
}