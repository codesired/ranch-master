import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user").notNull(), // user, admin, manager
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Livestock animals
export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tagId: varchar("tag_id").notNull().unique(),
  name: varchar("name"),
  species: varchar("species").notNull(), // cattle, sheep, goat, etc.
  breed: varchar("breed"),
  gender: varchar("gender").notNull(), // male, female
  birthDate: date("birth_date"),
  weight: varchar("weight"),
  color: varchar("color"),
  location: varchar("location"),
  status: varchar("status").default("active").notNull(), // active, sold, deceased
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health records
export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull().references(() => animals.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  recordType: varchar("record_type").notNull(), // vaccination, treatment, checkup
  description: text("description").notNull(),
  date: date("date").notNull(),
  veterinarian: varchar("veterinarian"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  nextDueDate: date("next_due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Breeding records
export const breedingRecords = pgTable("breeding_records", {
  id: serial("id").primaryKey(),
  motherId: integer("mother_id").notNull().references(() => animals.id),
  fatherId: integer("father_id").references(() => animals.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  breedingDate: date("breeding_date").notNull(),
  expectedBirthDate: date("expected_birth_date"),
  actualBirthDate: date("actual_birth_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // income, expense
  category: varchar("category").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  receiptUrl: varchar("receipt_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory items
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // feed, medicine, supplies
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit").notNull(), // kg, lbs, tons, pieces
  minThreshold: decimal("min_threshold", { precision: 10, scale: 2 }),
  location: varchar("location"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  expiryDate: date("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // tractor, harvester, irrigation, etc.
  model: varchar("model"),
  serialNumber: varchar("serial_number"),
  purchaseDate: date("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }),
  status: varchar("status").default("operational").notNull(), // operational, maintenance, repair, retired
  location: varchar("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment maintenance records
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // scheduled, repair, inspection
  description: text("description").notNull(),
  date: date("date").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  nextDueDate: date("next_due_date"),
  performedBy: varchar("performed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  category: varchar("category").notNull(), // receipt, certificate, report, photo
  description: text("description"),
  fileUrl: varchar("file_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  relatedId: integer("related_id"), // can reference animal, equipment, etc.
  relatedType: varchar("related_type"), // animal, equipment, transaction, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  animals: many(animals),
  healthRecords: many(healthRecords),
  breedingRecords: many(breedingRecords),
  transactions: many(transactions),
  inventory: many(inventory),
  equipment: many(equipment),
  maintenanceRecords: many(maintenanceRecords),
  documents: many(documents),
}));

export const animalsRelations = relations(animals, ({ one, many }) => ({
  user: one(users, { fields: [animals.userId], references: [users.id] }),
  healthRecords: many(healthRecords),
  breedingRecordsAsMother: many(breedingRecords, { relationName: "mother" }),
  breedingRecordsAsFather: many(breedingRecords, { relationName: "father" }),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  animal: one(animals, { fields: [healthRecords.animalId], references: [animals.id] }),
  user: one(users, { fields: [healthRecords.userId], references: [users.id] }),
}));

export const breedingRecordsRelations = relations(breedingRecords, ({ one }) => ({
  mother: one(animals, { fields: [breedingRecords.motherId], references: [animals.id], relationName: "mother" }),
  father: one(animals, { fields: [breedingRecords.fatherId], references: [animals.id], relationName: "father" }),
  user: one(users, { fields: [breedingRecords.userId], references: [users.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  user: one(users, { fields: [inventory.userId], references: [users.id] }),
}));

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  user: one(users, { fields: [equipment.userId], references: [users.id] }),
  maintenanceRecords: many(maintenanceRecords),
}));

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  equipment: one(equipment, { fields: [maintenanceRecords.equipmentId], references: [equipment.id] }),
  user: one(users, { fields: [maintenanceRecords.userId], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, { fields: [documents.userId], references: [users.id] }),
}));

// Insert schemas
export const insertAnimalSchema = createInsertSchema(animals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true,
});

export const insertBreedingRecordSchema = createInsertSchema(breedingRecords).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animals.$inferSelect;

export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;

export type InsertBreedingRecord = z.infer<typeof insertBreedingRecordSchema>;
export type BreedingRecord = typeof breedingRecords.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
