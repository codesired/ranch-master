import { Router } from 'express';
import { BaseController, requireAuth } from './base.controller';
import { storage } from '../storage';
import { authenticateFirebaseToken } from '../firebaseAuth';
import {
  insertTransactionSchema,
  insertBudgetSchema,
  insertAccountSchema,
  insertJournalEntrySchema,
} from '@shared/schema';

class FinanceController extends BaseController {
  // Get financial summary
  getFinancialSummary = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      return await storage.getFinancialSummary(userId, start, end);
    });
  });

  // Transaction routes
  getTransactions = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getTransactions(userId);
    });
  });

  createTransaction = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const transactionData = insertTransactionSchema.parse({ ...req.body, userId });
      return await storage.createTransaction(transactionData);
    }, 201);
  });

  updateTransaction = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      return await storage.updateTransaction(id, transactionData, userId);
    });
  });

  deleteTransaction = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      await storage.deleteTransaction(id, userId);
      return null;
    }, 204);
  });

  // Budget routes
  getBudgets = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getBudgets(userId);
    });
  });

  createBudget = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const budgetData = insertBudgetSchema.parse({ ...req.body, userId });
      return await storage.createBudget(budgetData);
    }, 201);
  });

  updateBudget = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      const budgetData = insertBudgetSchema.partial().parse(req.body);
      return await storage.updateBudget(id, budgetData, userId);
    });
  });

  deleteBudget = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      await storage.deleteBudget(id, userId);
      return null;
    }, 204);
  });

  getBudgetStatus = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const { period } = req.query;
      return await storage.getBudgetStatus(userId, period as string);
    });
  });

  // Account routes
  getAccounts = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getAccounts(userId);
    });
  });

  createAccount = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const accountData = insertAccountSchema.parse({ ...req.body, userId });
      return await storage.createAccount(accountData);
    }, 201);
  });

  updateAccount = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const id = this.parseId(req.params.id);
      const accountData = insertAccountSchema.partial().parse(req.body);
      return await storage.updateAccount(id, accountData, userId);
    });
  });

  // Journal entry routes
  getJournalEntries = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getJournalEntries(userId);
    });
  });

  createJournalEntry = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      const entryData = insertJournalEntrySchema.parse({ ...req.body, userId });
      return await storage.createJournalEntry(entryData);
    }, 201);
  });

  getTrialBalance = requireAuth(async (req: any, res) => {
    await this.handleRequest(req, res, async () => {
      const userId = this.validateUser(req);
      return await storage.getTrialBalance(userId);
    });
  });
}

// Create router and register routes
export function createFinanceRoutes(): Router {
  const router = Router();
  const controller = new FinanceController();

  // Apply Firebase authentication to all routes
  router.use(authenticateFirebaseToken);

  // Financial summary
  router.get('/financial-summary', controller.getFinancialSummary);

  // Transaction routes
  router.get('/transactions', controller.getTransactions);
  router.post('/transactions', controller.createTransaction);
  router.put('/transactions/:id', controller.updateTransaction);
  router.delete('/transactions/:id', controller.deleteTransaction);

  // Budget routes
  router.get('/budgets', controller.getBudgets);
  router.post('/budgets', controller.createBudget);
  router.put('/budgets/:id', controller.updateBudget);
  router.delete('/budgets/:id', controller.deleteBudget);
  router.get('/budget-status', controller.getBudgetStatus);

  // Account routes
  router.get('/accounts', controller.getAccounts);
  router.post('/accounts', controller.createAccount);
  router.put('/accounts/:id', controller.updateAccount);

  // Journal entry routes
  router.get('/journal-entries', controller.getJournalEntries);
  router.post('/journal-entries', controller.createJournalEntry);
  router.get('/trial-balance', controller.getTrialBalance);

  return router;
}