import { Router } from "express";
import { BostaImportController } from "../controllers/BostaImportController";

const router = Router();

// Test endpoint
router.get("/test", BostaImportController.testConnection);

// Create new import
router.post("/:brandId/imports", BostaImportController.createImport);

// Get imports for a brand
router.get("/:brandId/imports", BostaImportController.getImports);

// Get specific import
router.get("/imports/:importId", BostaImportController.getImportById);

// Create revenue from shipments
router.post(
  "/:brandId/imports/:importId/revenue",
  BostaImportController.createRevenueFromShipments
);

// Delete revenue from shipment
router.delete(
  "/revenue/:revenueId",
  BostaImportController.deleteRevenueFromShipment
);

// Get grouped Bosta revenue
router.get(
  "/:brandId/revenue/grouped",
  BostaImportController.getGroupedBostaRevenue
);

// Check for duplicates before import
router.post(
  "/:brandId/check-duplicates",
  BostaImportController.checkDuplicates
);

// Bulk operations
router.post("/bulk/delete", BostaImportController.bulkDeleteShipments);
router.post(
  "/bulk/update-status",
  BostaImportController.bulkUpdateShipmentStatus
);
router.post("/bulk/edit", BostaImportController.bulkEditShipments);

export default router;
