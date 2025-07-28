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
  pgEnum,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  text as mysqlText,
  varchar as mysqlVarchar,
  timestamp as mysqlTimestamp,
  json as mysqlJson,
  index as mysqlIndex,
  int as mysqlInt,
  decimal as mysqlDecimal,
  boolean as mysqlBoolean,
  date as mysqlDate,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInt,
  real as sqliteReal,
  blob as sqliteBlob,
  index as sqliteIndex,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Get database type from environment - default to postgresql for browser builds
const dbType = (typeof process !== 'undefined' && process.env?.DATABASE_TYPE || "postgresql").toLowerCase();

// Database-specific table creators
const createTable = (name: string, columns: any, tableOptions?: any) => {
  switch (dbType) {
    case "mysql":
      return mysqlTable(name, columns, tableOptions);
    case "sqlite":
      return sqliteTable(name, columns, tableOptions);
    default: // postgresql
      return pgTable(name, columns, tableOptions);
  }
};

// Database-specific column types
const getColumnTypes = () => {
  switch (dbType) {
    case "mysql":
      return {
        serial: () => mysqlInt("id").primaryKey().autoincrement(),
        varchar: (name: string, options?: { length?: number }) =>
          mysqlVarchar(name, { length: options?.length || 255 }),
        text: (name: string) => mysqlText(name),
        timestamp: (name: string) => mysqlTimestamp(name, { mode: "date" }),
        json: (name: string) => mysqlJson(name),
        integer: (name: string) => mysqlInt(name),
        decimal: (name: string, precision = 10, scale = 2) =>
          mysqlDecimal(name, { precision, scale }),
        boolean: (name: string) => mysqlBoolean(name),
        date: (name: string) => mysqlDate(name),
      };
    case "sqlite":
      return {
        serial: () =>
          sqliteInt("id", { mode: "number" }).primaryKey({
            autoIncrement: true,
          }),
        varchar: (name: string, options?: { length?: number }) =>
          sqliteText(name),
        text: (name: string) => sqliteText(name),
        timestamp: (name: string) => sqliteInt(name, { mode: "timestamp" }),
        json: (name: string) => sqliteText(name, { mode: "json" }),
        integer: (name: string) => sqliteInt(name, { mode: "number" }),
        decimal: (name: string, precision = 10, scale = 2) => sqliteReal(name),
        boolean: (name: string) => sqliteInt(name, { mode: "boolean" }),
        date: (name: string) => sqliteText(name),
      };
    default: // postgresql
      return {
        serial: () => serial("id"),
        varchar: (name: string, options?: { length?: number }) =>
          varchar(name, { length: options?.length || 255 }),
        text: (name: string) => text(name),
        timestamp: (name: string) => timestamp(name),
        json: (name: string) => jsonb(name),
        integer: (name: string) => integer(name),
        decimal: (name: string, precision = 10, scale = 2) =>
          decimal(name, { precision, scale }),
        boolean: (name: string) => boolean(name),
        date: (name: string) => date(name),
      };
  }
};

const col = getColumnTypes();

// Session storage table for Replit Auth
export const sessions = createTable(
  "sessions",
  {
    sid: col.varchar("sid").primaryKey(),
    sess: col.json("sess").notNull(),
    expire: col.timestamp("expire").notNull(),
  },
  (table: any) => ({
    expireIdx:
      dbType === "sqlite"
        ? undefined
        : index("IDX_session_expire").on(table.expire),
  }),
);

// User storage table for Replit Auth
export const users = createTable("users", {
  id: col.varchar("id").primaryKey().notNull(),
  email: col.varchar("email"),
  firstName: col.varchar("first_name"),
  lastName: col.varchar("last_name"),
  profileImageUrl: col.varchar("profile_image_url"),
  phone: col.varchar("phone"),
  address: col.text("address"),
  bio: col.text("bio"),
  role: col.varchar("role").default("user").notNull(),
  isActive: col.boolean("is_active").default(true),
  lastLogin: col.timestamp("last_login"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
  updatedAt: col.timestamp("updated_at").defaultNow
    ? col.timestamp("updated_at").defaultNow()
    : col.timestamp("updated_at"),
});

// Animals table
export const animals = createTable("animals", {
  id: col.serial().primaryKey(),
  userId: col.varchar("user_id").notNull(),
  tagId: col.varchar("tag_id").notNull(),
  name: col.varchar("name"),
  species: col.varchar("species").notNull(),
  breed: col.varchar("breed"),
  gender: col.varchar("gender").notNull(),
  birthDate: col.date("birth_date"),
  currentWeight: col.decimal("current_weight", 8, 2),
  birthWeight: col.decimal("birth_weight", 8, 2),
  color: col.varchar("color"),
  location: col.varchar("location"),
  status: col.varchar("status").default("active").notNull(),
  purchasePrice: col.decimal("purchase_price", 10, 2),
  purchaseDate: col.date("purchase_date"),
  salePrice: col.decimal("sale_price", 10, 2),
  saleDate: col.date("sale_date"),
  motherId: col.integer("mother_id"),
  fatherId: col.integer("father_id"),
  geneticInfo: col.text("genetic_info"),
  registrationNumber: col.varchar("registration_number"),
  microchipId: col.varchar("microchip_id"),
  notes: col.text("notes"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
  updatedAt: col.timestamp("updated_at").defaultNow
    ? col.timestamp("updated_at").defaultNow()
    : col.timestamp("updated_at"),
});

// Health records table
export const healthRecords = createTable("health_records", {
  id: col.serial().primaryKey(),
  animalId: col.integer("animal_id").notNull(),
  userId: col.varchar("user_id").notNull(),
  type: col.varchar("type").notNull(),
  description: col.text("description"),
  date: col.date("date").notNull(),
  veterinarian: col.varchar("veterinarian"),
  cost: col.decimal("cost", 10, 2),
  nextDueDate: col.date("next_due_date"),
  notes: col.text("notes"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
});

// Breeding records table
export const breedingRecords = createTable("breeding_records", {
  id: col.serial().primaryKey(),
  motherId: col.integer("mother_id").notNull(),
  fatherId: col.integer("father_id"),
  userId: col.varchar("user_id").notNull(),
  breedingDate: col.date("breeding_date").notNull(),
  expectedBirthDate: col.date("expected_birth_date"),
  actualBirthDate: col.date("actual_birth_date"),
  notes: col.text("notes"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
});

// Transactions table
export const transactions = createTable("transactions", {
  id: col.serial().primaryKey(),
  userId: col.varchar("user_id").notNull(),
  type: col.varchar("type").notNull(),
  category: col.varchar("category").notNull(),
  description: col.text("description"),
  amount: col.decimal("amount", 12, 2).notNull(),
  date: col.date("date").notNull(),
  paymentMethod: col.varchar("payment_method"),
  receiptUrl: col.varchar("receipt_url"),
  tags: dbType === "postgresql" ? text("tags").array() : col.text("tags"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
});

// Inventory table
export const inventory = createTable("inventory", {
  id: col.serial().primaryKey(),
  userId: col.varchar("user_id").notNull(),
  name: col.varchar("name").notNull(),
  category: col.varchar("category").notNull(),
  quantity: col.decimal("quantity", 10, 3).notNull(),
  unit: col.varchar("unit").notNull(),
  costPerUnit: col.decimal("cost_per_unit", 10, 2),
  supplier: col.varchar("supplier"),
  location: col.varchar("location"),
  expiryDate: col.date("expiry_date"),
  minThreshold: col.decimal("min_threshold", 10, 3),
  notes: col.text("notes"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
  updatedAt: col.timestamp("updated_at").defaultNow
    ? col.timestamp("updated_at").defaultNow()
    : col.timestamp("updated_at"),
});

// Equipment table
export const equipment = createTable("equipment", {
  id: col.serial().primaryKey(),
  userId: col.varchar("user_id").notNull(),
  name: col.varchar("name").notNull(),
  type: col.varchar("type").notNull(),
  model: col.varchar("model"),
  manufacturer: col.varchar("manufacturer"),
  serialNumber: col.varchar("serial_number"),
  purchaseDate: col.date("purchase_date"),
  purchasePrice: col.decimal("purchase_price", 12, 2),
  warrantyExpiry: col.date("warranty_expiry"),
  status: col.varchar("status").default("operational"),
  location: col.varchar("location"),
  notes: col.text("notes"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
  updatedAt: col.timestamp("updated_at").defaultNow
    ? col.timestamp("updated_at").defaultNow()
    : col.timestamp("updated_at"),
});

// Maintenance records table
export const maintenanceRecords = createTable("maintenance_records", {
  id: col.serial().primaryKey(),
  equipmentId: col.integer("equipment_id").notNull(),
  userId: col.varchar("user_id").notNull(),
  type: col.varchar("type").notNull(),
  description: col.text("description"),
  date: col.date("date").notNull(),
  cost: col.decimal("cost", 10, 2),
  performedBy: col.varchar("performed_by"),
  nextMaintenanceDate: col.date("next_maintenance_date"),
  notes: col.text("notes"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
});

// Documents with enhanced features
export const documents = createTable("documents", {
  id: col.serial().primaryKey(),
  userId: col.varchar("user_id").notNull(),
  title: col.varchar("title").notNull(),
  category: col.varchar("category").notNull(),
  description: col.text("description"),
  fileUrl: col.varchar("file_url").notNull(),
  fileName: col.varchar("file_name").notNull(),
  fileSize: col.integer("file_size"),
  mimeType: col.varchar("mime_type"),
  tags: dbType === "postgresql" ? text("tags").array() : col.text("tags"),
  isPublic: col.boolean("is_public").default(false),
  expiryDate: col.date("expiry_date"),
  reminderDate: col.date("reminder_date"),
  relatedEntityType: col.varchar("related_entity_type"),
  relatedEntityId: col.integer("related_entity_id"),
  uploadedBy: col.varchar("uploaded_by"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
});

// Budgets table
export const budgets = createTable("budgets", {
  id: col.serial().primaryKey(),
  userId: col.varchar("user_id").notNull(),
  name: col.varchar("name").notNull(),
  category: col.varchar("category").notNull(),
  budgetedAmount: col.decimal("budgeted_amount", 12, 2).notNull(),
  actualAmount: col.decimal("actual_amount", 12, 2).default(sql`'0.00'`),
  period: col.varchar("period").default("monthly"),
  startDate: col.date("start_date").notNull(),
  endDate: col.date("end_date").notNull(),
  isActive: col.boolean("is_active").default(true),
  notes: col.text("notes"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
  updatedAt: col.timestamp("updated_at").defaultNow
    ? col.timestamp("updated_at").defaultNow()
    : col.timestamp("updated_at"),
});

// Accounts table
export const accounts = createTable("accounts", {
  id: col.serial().primaryKey(),
  userId: col.varchar("user_id").notNull(),
  accountNumber: col.varchar("account_number").notNull(),
  name: col.varchar("name").notNull(),
  type: col.varchar("type").notNull(),
  subType: col.varchar("sub_type"),
  balance: col.decimal("balance", 12, 2).default(sql`'0.00'`),
  isActive: col.boolean("is_active").default(true),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
  updatedAt: col.timestamp("updated_at").defaultNow
    ? col.timestamp("updated_at").defaultNow()
    : col.timestamp("updated_at"),
});

// Journal entries table
export const journalEntries = createTable("journal_entries", {
  id: col.serial().primaryKey(),
  userId: col.varchar("user_id").notNull(),
  entryNumber: col.varchar("entry_number").notNull(),
  date: col.date("date").notNull(),
  description: col.text("description").notNull(),
  reference: col.varchar("reference"),
  totalDebit: col.decimal("total_debit", 12, 2).notNull(),
  totalCredit: col.decimal("total_credit", 12, 2).notNull(),
  status: col.varchar("status").default("draft"),
  createdAt: col.timestamp("created_at").defaultNow
    ? col.timestamp("created_at").defaultNow()
    : col.timestamp("created_at"),
  updatedAt: col.timestamp("updated_at").defaultNow
    ? col.timestamp("updated_at").defaultNow()
    : col.timestamp("updated_at"),
});

// User notification settings table
export const userNotificationSettings = createTable(
  "user_notification_settings",
  {
    id: col.serial().primaryKey(),
    userId: col.varchar("user_id").notNull(),
    emailNotifications: col.boolean("email_notifications").default(true),
    pushNotifications: col.boolean("push_notifications").default(true),
    smsNotifications: col.boolean("sms_notifications").default(false),
    healthAlerts: col.boolean("health_alerts").default(true),
    lowStockAlerts: col.boolean("low_stock_alerts").default(true),
    weatherAlerts: col.boolean("weather_alerts").default(true),
    maintenanceReminders: col.boolean("maintenance_reminders").default(true),
    financialAlerts: col.boolean("financial_alerts").default(true),
    breedingReminders: col.boolean("breeding_reminders").default(true),
    systemUpdates: col.boolean("system_updates").default(false),
    createdAt: col.timestamp("created_at").defaultNow
      ? col.timestamp("created_at").defaultNow()
      : col.timestamp("created_at"),
    updatedAt: col.timestamp("updated_at").defaultNow
      ? col.timestamp("updated_at").defaultNow()
      : col.timestamp("updated_at"),
  },
);

// Relations (same for all database types)
export const usersRelations = relations(users, ({ many }) => ({
  animals: many(animals),
  healthRecords: many(healthRecords),
  breedingRecords: many(breedingRecords),
  transactions: many(transactions),
  inventory: many(inventory),
  equipment: many(equipment),
  maintenanceRecords: many(maintenanceRecords),
  documents: many(documents),
  budgets: many(budgets),
  accounts: many(accounts),
  journalEntries: many(journalEntries),
}));

export const animalsRelations = relations(animals, ({ one, many }) => ({
  user: one(users, { fields: [animals.userId], references: [users.id] }),
  healthRecords: many(healthRecords),
  breedingRecordsAsMother: many(breedingRecords, { relationName: "mother" }),
  breedingRecordsAsFather: many(breedingRecords, { relationName: "father" }),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  animal: one(animals, {
    fields: [healthRecords.animalId],
    references: [animals.id],
  }),
  user: one(users, { fields: [healthRecords.userId], references: [users.id] }),
}));

export const breedingRecordsRelations = relations(
  breedingRecords,
  ({ one }) => ({
    mother: one(animals, {
      fields: [breedingRecords.motherId],
      references: [animals.id],
      relationName: "mother",
    }),
    father: one(animals, {
      fields: [breedingRecords.fatherId],
      references: [animals.id],
      relationName: "father",
    }),
    user: one(users, {
      fields: [breedingRecords.userId],
      references: [users.id],
    }),
  }),
);

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

export const maintenanceRecordsRelations = relations(
  maintenanceRecords,
  ({ one }) => ({
    equipment: one(equipment, {
      fields: [maintenanceRecords.equipmentId],
      references: [equipment.id],
    }),
    user: one(users, {
      fields: [maintenanceRecords.userId],
      references: [users.id],
    }),
  }),
);

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, { fields: [documents.userId], references: [users.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, { fields: [journalEntries.userId], references: [users.id] }),
}));

export const userNotificationSettingsRelations = relations(
  userNotificationSettings,
  ({ one }) => ({
    user: one(users, {
      fields: [userNotificationSettings.userId],
      references: [users.id],
    }),
  }),
);

// Type definitions (inferred from tables)
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAnimal = typeof animals.$inferInsert;
export type Animal = typeof animals.$inferSelect;
export type InsertHealthRecord = typeof healthRecords.$inferInsert;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertBreedingRecord = typeof breedingRecords.$inferInsert;
export type BreedingRecord = typeof breedingRecords.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;
export type Equipment = typeof equipment.$inferSelect;
export type InsertMaintenanceRecord = typeof maintenanceRecords.$inferInsert;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertUserNotificationSettings =
  typeof userNotificationSettings.$inferInsert;
export type UserNotificationSettings =
  typeof userNotificationSettings.$inferSelect;
export type UpdateUserProfile = Partial<
  Pick<User, "firstName" | "lastName" | "phone" | "address" | "bio">
>;

// Form schemas
export const insertAnimalSchema = createInsertSchema(animals);
export const insertHealthRecordSchema = createInsertSchema(healthRecords);
export const insertBreedingRecordSchema = createInsertSchema(breedingRecords);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertInventorySchema = createInsertSchema(inventory);
export const insertEquipmentSchema = createInsertSchema(equipment);
export const insertMaintenanceRecordSchema =
  createInsertSchema(maintenanceRecords);
export const insertDocumentSchema = createInsertSchema(documents);
export const insertBudgetSchema = createInsertSchema(budgets);
export const insertAccountSchema = createInsertSchema(accounts);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const insertUserNotificationSettingsSchema = createInsertSchema(
  userNotificationSettings,
);

export const updateUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(), 
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
});
