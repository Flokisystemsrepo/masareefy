import express from "express";
import { authenticateToken } from "../middleware/auth";
import { ReceivablesPayablesController } from "../controllers/financial/ReceivablesPayablesController";
import { RevenuesCostsController } from "../controllers/financial/RevenuesCostsController";
import { TransfersInventoryController } from "../controllers/financial/TransfersInventoryController";
import { ProjectTargetsController } from "../controllers/financial/ProjectTargetsController";
import { TeamTasksController } from "../controllers/financial/TeamTasksController";
import { WalletController } from "../controllers/financial/WalletController";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ===== RECEIVABLES & PAYABLES =====
router.post(
  "/brands/:brandId/receivables",
  ReceivablesPayablesController.createReceivable
);
router.get(
  "/brands/:brandId/receivables",
  ReceivablesPayablesController.getReceivables
);
router.get(
  "/brands/:brandId/receivables/:id",
  ReceivablesPayablesController.getReceivableById
);
router.put(
  "/brands/:brandId/receivables/:id",
  ReceivablesPayablesController.updateReceivable
);
router.delete(
  "/brands/:brandId/receivables/:id",
  ReceivablesPayablesController.deleteReceivable
);

router.post(
  "/brands/:brandId/payables",
  ReceivablesPayablesController.createPayable
);
router.get(
  "/brands/:brandId/payables",
  ReceivablesPayablesController.getPayables
);
router.get(
  "/brands/:brandId/payables/:id",
  ReceivablesPayablesController.getPayableById
);
router.put(
  "/brands/:brandId/payables/:id",
  ReceivablesPayablesController.updatePayable
);
router.delete(
  "/brands/:brandId/payables/:id",
  ReceivablesPayablesController.deletePayable
);

// ===== REVENUES & COSTS =====
router.post("/brands/:brandId/revenues", RevenuesCostsController.createRevenue);
router.get("/brands/:brandId/revenues", RevenuesCostsController.getRevenues);
router.get(
  "/brands/:brandId/revenues/:id",
  RevenuesCostsController.getRevenueById
);
router.put(
  "/brands/:brandId/revenues/:id",
  RevenuesCostsController.updateRevenue
);
router.delete(
  "/brands/:brandId/revenues/:id",
  RevenuesCostsController.deleteRevenue
);

router.post("/brands/:brandId/costs", RevenuesCostsController.createCost);
router.get("/brands/:brandId/costs", RevenuesCostsController.getCosts);
router.get("/brands/:brandId/costs/:id", RevenuesCostsController.getCostById);
router.put("/brands/:brandId/costs/:id", RevenuesCostsController.updateCost);
router.delete("/brands/:brandId/costs/:id", RevenuesCostsController.deleteCost);

// ===== TRANSFERS =====
router.post(
  "/brands/:brandId/transfers",
  TransfersInventoryController.createTransfer
);
router.get(
  "/brands/:brandId/transfers",
  TransfersInventoryController.getTransfers
);
router.get(
  "/brands/:brandId/transfers/:id",
  TransfersInventoryController.getTransferById
);
router.put(
  "/brands/:brandId/transfers/:id",
  TransfersInventoryController.updateTransfer
);
router.delete(
  "/brands/:brandId/transfers/:id",
  TransfersInventoryController.deleteTransfer
);

// ===== INVENTORY =====
router.post(
  "/brands/:brandId/inventory",
  TransfersInventoryController.createInventoryItem
);
router.get(
  "/brands/:brandId/inventory",
  TransfersInventoryController.getInventoryItems
);
router.get(
  "/brands/:brandId/inventory/:id",
  TransfersInventoryController.getInventoryItemById
);
router.put(
  "/brands/:brandId/inventory/:id",
  TransfersInventoryController.updateInventoryItem
);
router.delete(
  "/brands/:brandId/inventory/:id",
  TransfersInventoryController.deleteInventoryItem
);

// ===== PROJECT TARGETS =====
router.post(
  "/brands/:brandId/project-targets",
  ProjectTargetsController.createProjectTarget
);
router.get(
  "/brands/:brandId/project-targets",
  ProjectTargetsController.getProjectTargets
);
router.get(
  "/brands/:brandId/project-targets/:id",
  ProjectTargetsController.getProjectTargetById
);
router.put(
  "/brands/:brandId/project-targets/:id",
  ProjectTargetsController.updateProjectTarget
);
router.delete(
  "/brands/:brandId/project-targets/:id",
  ProjectTargetsController.deleteProjectTarget
);

// ===== TEAM =====
router.post("/brands/:brandId/team", TeamTasksController.createTeamMember);
router.get("/brands/:brandId/team", TeamTasksController.getTeamMembers);
router.get("/brands/:brandId/team/:id", TeamTasksController.getTeamMemberById);
router.put("/brands/:brandId/team/:id", TeamTasksController.updateTeamMember);
router.delete(
  "/brands/:brandId/team/:id",
  TeamTasksController.deleteTeamMember
);

// ===== TASKS =====
router.post("/brands/:brandId/tasks", TeamTasksController.createTask);
router.get("/brands/:brandId/tasks", TeamTasksController.getTasks);
router.get("/brands/:brandId/tasks/:id", TeamTasksController.getTaskById);
router.put("/brands/:brandId/tasks/:id", TeamTasksController.updateTask);
router.delete("/brands/:brandId/tasks/:id", TeamTasksController.deleteTask);

// ===== WALLETS =====
router.post("/brands/:brandId/wallets", WalletController.createWallet);
router.get("/brands/:brandId/wallets", WalletController.getWallets);
router.get("/brands/:brandId/wallets/:id", WalletController.getWalletById);
router.put("/brands/:brandId/wallets/:id", WalletController.updateWallet);
router.delete("/brands/:brandId/wallets/:id", WalletController.deleteWallet);

// ===== WALLET TRANSACTIONS =====
router.post(
  "/brands/:brandId/wallets/transactions",
  WalletController.createWalletTransaction
);
router.get(
  "/brands/:brandId/transactions",
  WalletController.getAllTransactions
);
router.get(
  "/brands/:brandId/wallets/transactions/:transactionId",
  WalletController.getWalletTransactionById
);
router.put(
  "/brands/:brandId/wallets/transactions/:transactionId",
  WalletController.updateTransaction
);
router.delete(
  "/brands/:brandId/wallets/transactions/:transactionId",
  WalletController.deleteTransaction
);
router.get(
  "/brands/:brandId/wallets/:walletId/transactions",
  WalletController.getWalletTransactions
);

// ===== METRICS =====
router.get(
  "/brands/:brandId/metrics",
  ReceivablesPayablesController.getFinancialMetrics
);
router.get(
  "/brands/:brandId/revenue-metrics",
  RevenuesCostsController.getRevenueMetrics
);
router.get(
  "/brands/:brandId/cost-metrics",
  RevenuesCostsController.getCostMetrics
);
router.get(
  "/brands/:brandId/transfer-metrics",
  TransfersInventoryController.getTransferMetrics
);
router.get(
  "/brands/:brandId/inventory-metrics",
  TransfersInventoryController.getInventoryMetrics
);
router.get(
  "/brands/:brandId/project-target-metrics",
  ProjectTargetsController.getProjectTargetMetrics
);
router.get("/brands/:brandId/task-metrics", TeamTasksController.getTaskMetrics);
router.get(
  "/brands/:brandId/wallet-metrics",
  WalletController.getWalletMetrics
);

// ===== STATUS UPDATES =====
router.post("/update-statuses", ReceivablesPayablesController.updateStatuses);

export default router;
