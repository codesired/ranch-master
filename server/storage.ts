import {
  users,
  animals,
  healthRecords,
  breedingRecords,
  transactions,
  inventory,
  equipment,
  maintenanceRecords,
  documents,
  budgets,
  accounts,
  journalEntries,
  userNotificationSettings
} from "@shared/schema";
import { db } from "./db";
import { desc, eq, and, gte, lte, isNull, or, sql, sum, count } from "drizzle-orm";
import type { 
  UpsertUser, 
  User, 
  InsertAnimal, 
  Animal, 
  InsertHealthRecord, 
  HealthRecord, 
  InsertBreedingRecord, 
  BreedingRecord, 
  InsertTransaction, 
  Transaction, 
  InsertInventory, 
  Inventory, 
  InsertEquipment, 
  Equipment, 
  InsertMaintenanceRecord, 
  MaintenanceRecord, 
  InsertDocument, 
  Document,
  InsertBudget,
  Budget,
  InsertAccount,
  Account,
  InsertJournalEntry,
  JournalEntry,
  InsertUserNotificationSettings,
  UserNotificationSettings,
  UpdateUserProfile
} from "@shared/schema";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<User>;

  // User notification settings
  getUserNotificationSettings(userId: string): Promise<UserNotificationSettings | undefined>;
  upsertUserNotificationSettings(settings: InsertUserNotificationSettings): Promise<UserNotificationSettings>;

  // Animal operations
  getAnimals(userId: string): Promise<Animal[]>;
  getAnimal(id: number, userId: string): Promise<Animal | undefined>;
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  updateAnimal(id: number, animal: Partial<InsertAnimal>, userId: string): Promise<Animal>;
  deleteAnimal(id: number, userId: string): Promise<void>;

  // Health record operations
  getHealthRecords(animalId: number, userId: string): Promise<HealthRecord[]>;
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  updateHealthRecord(id: number, record: Partial<InsertHealthRecord>, userId: string): Promise<HealthRecord>;
  deleteHealthRecord(id: number, userId: string): Promise<void>;

  // Breeding record operations
  getBreedingRecords(userId: string): Promise<BreedingRecord[]>;
  createBreedingRecord(record: InsertBreedingRecord): Promise<BreedingRecord>;
  updateBreedingRecord(id: number, record: Partial<InsertBreedingRecord>, userId: string): Promise<BreedingRecord>;
  deleteBreedingRecord(id: number, userId: string): Promise<void>;

  // Transaction operations
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>, userId: string): Promise<Transaction>;
  deleteTransaction(id: number, userId: string): Promise<void>;
  getFinancialSummary(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    incomeByCategory: Array<{ category: string; amount: number }>;
    expensesByCategory: Array<{ category: string; amount: number }>;
  }>;

  // Inventory operations
  getInventory(userId: string): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>, userId: string): Promise<Inventory>;
  deleteInventoryItem(id: number, userId: string): Promise<void>;
  getLowStockItems(userId: string): Promise<Inventory[]>;

  // Equipment operations
  getEquipment(userId: string): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>, userId: string): Promise<Equipment>;
  deleteEquipment(id: number, userId: string): Promise<void>;

  // Maintenance record operations
  getMaintenanceRecords(equipmentId: number, userId: string): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>, userId: string): Promise<MaintenanceRecord>;
  deleteMaintenanceRecord(id: number, userId: string): Promise<void>;

  // Document operations
  getDocuments(userId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>, userId: string): Promise<Document>;
  deleteDocument(id: number, userId: string): Promise<void>;

    // Budget operations
  getBudgets(userId: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>, userId: string): Promise<Budget>;
  deleteBudget(id: number, userId: string): Promise<void>;

  // Account operations
  getAccounts(userId: string): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>, userId: string): Promise<Account>;
  deleteAccount(id: number, userId: string): Promise<void>;

  // Journal Entry operations
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(journalEntry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, journalEntry: Partial<InsertJournalEntry>, userId: string): Promise<JournalEntry>;
  deleteJournalEntry(id: number, userId: string): Promise<void>;

  // Dashboard operations
  getDashboardStats(userId: string): Promise<{
    totalAnimals: number;
    healthAlerts: number;
    lowStockItems: number;
    equipmentIssues: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
  }>;

  // Admin operations
  getAllUsers(): Promise<any[]>;
  getAdminStats(): Promise<any>;
  getAuditLogs(): Promise<any[]>;
  createUser(userData: any): Promise<any>;
  updateUserRole(userId: string, role: string): Promise<any>;
  updateUserStatus(userId: string, isActive: boolean): Promise<any>;
  bulkUpdateUsers(userIds: string[], action: string, data?: any): Promise<any>;
  performSystemAction(action: string): Promise<any>;
  getUserSettings(userId: string, type: string): Promise<any>;
  updateUserSettings(userId: string, type: string, settings: any): Promise<any>;
  changeUserPassword(userId: string, newPassword: string): Promise<any>;
  exportUserData(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Animal operations
  async getAnimals(userId: string): Promise<Animal[]> {
    return await db
      .select()
      .from(animals)
      .where(eq(animals.userId, userId))
      .orderBy(desc(animals.createdAt));
  }

  async getAnimal(id: number, userId: string): Promise<Animal | undefined> {
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, id), eq(animals.userId, userId)));
    return animal;
  }

  async createAnimal(animal: InsertAnimal): Promise<Animal> {
    const [newAnimal] = await db.insert(animals).values(animal).returning();
    return newAnimal;
  }

  async updateAnimal(id: number, animal: Partial<InsertAnimal>, userId: string): Promise<Animal> {
    const [updatedAnimal] = await db
      .update(animals)
      .set({ ...animal, updatedAt: new Date() })
      .where(and(eq(animals.id, id), eq(animals.userId, userId)))
      .returning();
    return updatedAnimal;
  }

  async deleteAnimal(id: number, userId: string): Promise<void> {
    await db
      .delete(animals)
      .where(and(eq(animals.id, id), eq(animals.userId, userId)));
  }

  // Health record operations
  async getHealthRecords(animalId: number, userId: string): Promise<HealthRecord[]> {
    return await db
      .select()
      .from(healthRecords)
      .where(and(eq(healthRecords.animalId, animalId), eq(healthRecords.userId, userId)))
      .orderBy(desc(healthRecords.date));
  }

  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const [newRecord] = await db.insert(healthRecords).values(record).returning();
    return newRecord;
  }

  async updateHealthRecord(id: number, record: Partial<InsertHealthRecord>, userId: string): Promise<HealthRecord> {
    const [updatedRecord] = await db
      .update(healthRecords)
      .set(record)
      .where(and(eq(healthRecords.id, id), eq(healthRecords.userId, userId)))
      .returning();
    return updatedRecord;
  }

  async deleteHealthRecord(id: number, userId: string): Promise<void> {
    await db
      .delete(healthRecords)
      .where(and(eq(healthRecords.id, id), eq(healthRecords.userId, userId)));
  }

  // Breeding record operations
  async getBreedingRecords(userId: string): Promise<BreedingRecord[]> {
    return await db
      .select()
      .from(breedingRecords)
      .where(eq(breedingRecords.userId, userId))
      .orderBy(desc(breedingRecords.breedingDate));
  }

  async createBreedingRecord(record: InsertBreedingRecord): Promise<BreedingRecord> {
    const [newRecord] = await db.insert(breedingRecords).values(record).returning();
    return newRecord;
  }

  async updateBreedingRecord(id: number, record: Partial<InsertBreedingRecord>, userId: string): Promise<BreedingRecord> {
    const [updatedRecord] = await db
      .update(breedingRecords)
      .set(record)
      .where(and(eq(breedingRecords.id, id), eq(breedingRecords.userId, userId)))
      .returning();
    return updatedRecord;
  }

  async deleteBreedingRecord(id: number, userId: string): Promise<void> {
    await db
      .delete(breedingRecords)
      .where(and(eq(breedingRecords.id, id), eq(breedingRecords.userId, userId)));
  }

  // Transaction operations
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>, userId: string): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number, userId: string): Promise<void> {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  }

  async getFinancialSummary(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    incomeByCategory: Array<{ category: string; amount: number }>;
    expensesByCategory: Array<{ category: string; amount: number }>;
  }> {
    const conditions = [eq(transactions.userId, userId)];

    if (startDate) {
      conditions.push(gte(transactions.date, startDate.toISOString().split('T')[0]));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate.toISOString().split('T')[0]));
    }

    const query = db
      .select({
        type: transactions.type,
        category: transactions.category,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(...conditions));

    const results = await query
      .groupBy(transactions.type, transactions.category)
      .orderBy(transactions.type, transactions.category);

    const incomeByCategory: Array<{ category: string; amount: number }> = [];
    const expensesByCategory: Array<{ category: string; amount: number }> = [];
    let totalIncome = 0;
    let totalExpenses = 0;

    results.forEach((result) => {
      const amount = parseFloat(result.total || '0');
      if (result.type === 'income') {
        totalIncome += amount;
        incomeByCategory.push({ category: result.category, amount });
      } else {
        totalExpenses += amount;
        expensesByCategory.push({ category: result.category, amount });
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      incomeByCategory,
      expensesByCategory,
    };
  }

  // Inventory operations
  async getInventory(userId: string): Promise<Inventory[]> {
    return await db
      .select()
      .from(inventory)
      .where(eq(inventory.userId, userId))
      .orderBy(desc(inventory.createdAt));
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventory>, userId: string): Promise<Inventory> {
    const [updatedItem] = await db
      .update(inventory)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(inventory.id, id), eq(inventory.userId, userId)))
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: number, userId: string): Promise<void> {
    await db
      .delete(inventory)
      .where(and(eq(inventory.id, id), eq(inventory.userId, userId)));
  }

  async getLowStockItems(userId: string): Promise<Inventory[]> {
    return await db
      .select()
      .from(inventory)
      .where(and(
        eq(inventory.userId, userId),
        sql`${inventory.quantity} <= ${inventory.minThreshold}`
      ))
      .orderBy(inventory.name);
  }

  // Equipment operations
  async getEquipment(userId: string): Promise<Equipment[]> {
    return await db
      .select()
      .from(equipment)
      .where(eq(equipment.userId, userId))
      .orderBy(desc(equipment.createdAt));
  }

  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [newEquipment] = await db.insert(equipment).values(equipmentData).returning();
    return newEquipment;
  }

  async updateEquipment(id: number, equipmentData: Partial<InsertEquipment>, userId: string): Promise<Equipment> {
    const [updatedEquipment] = await db
      .update(equipment)
      .set({ ...equipmentData, updatedAt: new Date() })
      .where(and(eq(equipment.id, id), eq(equipment.userId, userId)))
      .returning();
    return updatedEquipment;
  }

  async deleteEquipment(id: number, userId: string): Promise<void> {
    await db
      .delete(equipment)
      .where(and(eq(equipment.id, id), eq(equipment.userId, userId)));
  }

  // Maintenance record operations
  async getMaintenanceRecords(equipmentId: number, userId: string): Promise<MaintenanceRecord[]> {
    return await db
      .select()
      .from(maintenanceRecords)
      .where(and(eq(maintenanceRecords.equipmentId, equipmentId), eq(maintenanceRecords.userId, userId)))
      .orderBy(desc(maintenanceRecords.date));
  }

  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [newRecord] = await db.insert(maintenanceRecords).values(record).returning();
    return newRecord;
  }

  async updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>, userId: string): Promise<MaintenanceRecord> {
    const [updatedRecord] = await db
      .update(maintenanceRecords)
      .set(record)
      .where(and(eq(maintenanceRecords.id, id), eq(maintenanceRecords.userId, userId)))
      .returning();
    return updatedRecord;
  }

  async deleteMaintenanceRecord(id: number, userId: string): Promise<void> {
    await db
      .delete(maintenanceRecords)
      .where(and(eq(maintenanceRecords.id, id), eq(maintenanceRecords.userId, userId)));
  }

  // Document operations
  async getDocuments(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>, userId: string): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set(document)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number, userId: string): Promise<void> {
    await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));
  }

    // Budget operations
  async getBudgets(userId: string): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.createdAt));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>, userId: string): Promise<Budget> {
    const [updatedBudget] = await db
      .update(budgets)
      .set(budget)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();
    return updatedBudget;
  }

  async deleteBudget(id: number, userId: string): Promise<void> {
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  }

  // Account operations
  async getAccounts(userId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>, userId: string): Promise<Account> {
    const [updatedAccount] = await db
      .update(accounts)
      .set(account)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();
    return updatedAccount;
  }

  async deleteAccount(id: number, userId: string): Promise<void> {
    await db
      .delete(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
  }

  // Journal Entry operations
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.date));
  }

  async createJournalEntry(journalEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [newJournalEntry] = await db.insert(journalEntries).values(journalEntry).returning();
    return newJournalEntry;
  }

  async updateJournalEntry(id: number, journalEntry: Partial<InsertJournalEntry>, userId: string): Promise<JournalEntry> {
    const [updatedJournalEntry] = await db
      .update(journalEntries)
      .set(journalEntry)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .returning();
    return updatedJournalEntry;
  }

  async deleteJournalEntry(id: number, userId: string): Promise<void> {
    await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
  }

  // Budget status operations
  async getBudgetStatus(userId: string, period?: string): Promise<any[]> {
    const conditions = [eq(budgets.userId, userId)];

    if (period) {
      conditions.push(eq(budgets.period, period));
    }

    try {
      const budgetStatus = await db
        .select()
        .from(budgets)
        .where(and(...conditions))
        .orderBy(desc(budgets.createdAt));

      return budgetStatus;
    } catch (error) {
      console.error("Error fetching budget status:", error);
      return [];
    }
  }

  // Trial balance operations
  async getTrialBalance(userId: string): Promise<any[]> {
    try {
      const trialBalance = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId))
        .orderBy(accounts.name);

      return trialBalance;
    } catch (error) {
      console.error("Error fetching trial balance:", error);
      return [];
    }
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<{
    totalAnimals: number;
    healthAlerts: number;
    lowStockItems: number;
    equipmentIssues: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
  }> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Count total animals
    const animalCountResult = await db
      .select({ count: count() })
      .from(animals)
      .where(and(eq(animals.userId, userId), eq(animals.status, 'active')));
    const animalCount = animalCountResult[0] || { count: 0 };

    // Count health alerts (overdue vaccinations/treatments)
    const healthAlertsResult = await db
      .select({ count: count() })
      .from(healthRecords)
      .where(and(
        eq(healthRecords.userId, userId),
        lte(healthRecords.nextDueDate, now.toISOString().split('T')[0])
      ));
    const healthAlertsCount = healthAlertsResult[0] || { count: 0 };

    // Count low stock items
    const lowStockCount = await this.getLowStockItems(userId);

    // Count equipment issues
    const equipmentIssuesResult = await db
      .select({ count: count() })
      .from(equipment)
      .where(and(
        eq(equipment.userId, userId),
        or(eq(equipment.status, 'maintenance'), eq(equipment.status, 'repair'))
      ));
    const equipmentIssuesCount = equipmentIssuesResult[0] || { count: 0 };

    // Calculate monthly revenue and expenses
    const monthlyTransactions = await db
      .select({
        type: transactions.type,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, monthStart.toISOString().split('T')[0]),
        lte(transactions.date, monthEnd.toISOString().split('T')[0])
      ))
      .groupBy(transactions.type);

    let monthlyRevenue = 0;
    let monthlyExpenses = 0;

    monthlyTransactions.forEach((transaction) => {
      const amount = parseFloat(transaction.total || '0');
      if (transaction.type === 'income') {
        monthlyRevenue += amount;
      } else {
        monthlyExpenses += amount;
      }
    });

    return {
      totalAnimals: animalCount.count,
      healthAlerts: healthAlertsCount.count,
      lowStockItems: lowStockCount.length,
      equipmentIssues: equipmentIssuesCount.count,
      monthlyRevenue,
      monthlyExpenses,
    };
  }

  async updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async getUserNotificationSettings(userId: string): Promise<UserNotificationSettings | undefined> {
    const settings = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, userId))
      .limit(1);

    return settings[0];
  }

  async upsertUserNotificationSettings(settings: InsertUserNotificationSettings): Promise<UserNotificationSettings> {
    const existingSettings = await this.getUserNotificationSettings(settings.userId);

    if (existingSettings) {
      const [updatedSettings] = await db
        .update(userNotificationSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(userNotificationSettings.userId, settings.userId))
        .returning();
      return updatedSettings;
    } else {
      const [newSettings] = await db
        .insert(userNotificationSettings)
        .values(settings)
        .returning();
      return newSettings;
    }
  }

  async seedDatabase(userId: string): Promise<boolean> {
    // This would be implemented to seed the database with sample data
    return true;
  }

  async getAllUsers(): Promise<any[]> {
    const users = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
        isActive: users.isActive,
        phone: users.phone,
        address: users.address,
      })
      .from(users)
      .orderBy(users.createdAt);

    return users;
  }

  async getAdminStats(): Promise<any> {
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const activeUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isActive, true));

    const totalAnimals = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals);

    const totalTransactions = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions);

    const totalDocuments = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents);

    const totalEquipment = await db
      .select({ count: sql<number>`count(*)` })
      .from(equipment);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      totalAnimals: totalAnimals[0]?.count || 0,
      totalTransactions: totalTransactions[0]?.count || 0,
      totalDocuments: totalDocuments[0]?.count || 0,
      totalEquipment: totalEquipment[0]?.count || 0,
      systemHealth: 98,
      diskUsage: 45,
      memoryUsage: 67,
      cpuUsage: 23,
      uptime: `${Math.floor(Math.random() * 30)} days`
    };
  }

  async getAuditLogs(): Promise<any[]> {
    // Mock audit logs for now - in a real system, you'd have an audit_logs table
    const allUsers = await this.getAllUsers();

    const mockLogs = [];
    for (let i = 0; i < 20; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const actions = ['create', 'update', 'delete', 'login', 'logout'];
      const entities = ['animal', 'transaction', 'document', 'equipment', 'user'];

      mockLogs.push({
        id: i + 1,
        userId: randomUser?.id || 'system',
        action: actions[Math.floor(Math.random() * actions.length)],
        entityType: entities[Math.floor(Math.random() * entities.length)],
        entityId: Math.floor(Math.random() * 100),
        details: `User performed ${actions[Math.floor(Math.random() * actions.length)]} operation`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
      });
    }

    return mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createUser(userData: any): Promise<any> {
    const result = await db
      .insert(users)
      .values({
        id: userData.email, // Using email as ID for now
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        phone: userData.phone,
        address: userData.address,
        isActive: true,
        createdAt: new Date(),
      })
      .returning();

    return result[0];
  }

  async updateUserRole(userId: string, role: string): Promise<any> {
    const result = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();

    return result[0];
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<any> {
    const result = await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, userId))
      .returning();

    return result[0];
  }

  async bulkUpdateUsers(userIds: string[], action: string, data?: any): Promise<any> {
    const results = [];

    for (const userId of userIds) {
      let result;
      switch (action) {
        case 'activate':
          result = await this.updateUserStatus(userId, true);
          break;
        case 'deactivate':
          result = await this.updateUserStatus(userId, false);
          break;
        case 'change-role':
          result = await this.updateUserRole(userId, data.role);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      results.push(result);
    }

    return { updated: results.length, results };
  }

  async performSystemAction(action: string): Promise<any> {
    // Mock system actions
    switch (action) {
      case 'backup':
        return { message: 'Database backup initiated', status: 'success' };
      case 'export-logs':
        return { message: 'System logs exported', status: 'success' };
      case 'clear-cache':
        return { message: 'System cache cleared', status: 'success' };
      case 'optimize-db':
        return { message: 'Database optimization completed', status: 'success' };
      default:
        throw new Error(`Unknown system action: ${action}`);
    }
  }

  async getUserSettings(userId: string, type: string): Promise<any> {
    // Mock settings - in a real app, you'd have a user_settings table
    const defaultSettings = {
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        healthAlerts: true,
        lowStockAlerts: true,
        weatherAlerts: true,
        maintenanceReminders: true,
        financialAlerts: true,
        breedingReminders: true,
        systemUpdates: false,
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginNotifications: true,
        deviceTracking: true,
      },
      appearance: {
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/dd/yyyy',
        currency: 'USD',
        compactMode: false,
      },
      privacy: {
        profileVisibility: 'private',
        dataSharing: false,
        analyticsTracking: true,
        marketingEmails: false,
        thirdPartyIntegrations: false,
      }
    };

    return defaultSettings[type] || {};
  }

  async updateUserSettings(userId: string, type: string, settings: any): Promise<any> {
    // Mock update - in a real app, you'd update the user_settings table
    return settings;
  }

  async changeUserPassword(userId: string, newPassword: string): Promise<any> {
    // Mock password change - in a real app, you'd hash and store the password
    return { message: 'Password changed successfully' };
  }

  async exportUserData(userId: string): Promise<any> {
    // Mock data export - in a real app, you'd generate and return user data
    return { message: 'Data export initiated. Download link will be sent via email.' };
  }
}

export const storage = new DatabaseStorage();