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
  journalEntries
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
  JournalEntry
} from "@shared/schema";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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
        // Use raw SQL for comparison between columns
        // qty <= minThreshold
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
}

export const storage = new DatabaseStorage();