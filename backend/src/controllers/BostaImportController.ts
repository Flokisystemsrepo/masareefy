import { Request, Response } from "express";
import { BostaImportService } from "../services/BostaImportService";

export class BostaImportController {
  // Test endpoint to check if service is working
  static async testConnection(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        message: "Bosta import service is working",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error in testConnection:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Create new import
  static async createImport(req: Request, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;
      const data = req.body;

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.createImport(brandId, data);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json({
        success: true,
        data: result.data,
        message: "Bosta import created successfully",
      });
    } catch (error: any) {
      console.error("Error in createImport:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Get imports for a brand
  static async getImports(req: Request, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;
      const { page, limit } = req.query;

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.getImports(brandId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: "Imports retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error in getImports:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Get specific import
  static async getImportById(req: Request, res: Response): Promise<void> {
    try {
      const { importId } = req.params;

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.getImportById(importId);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: "Import retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error in getImportById:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Create revenue from shipments
  static async createRevenueFromShipments(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { brandId, importId } = req.params;
      const { shipmentIds } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.createRevenueFromShipments(
        brandId,
        importId,
        shipmentIds,
        userId
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: "Revenue entries created successfully",
      });
    } catch (error: any) {
      console.error("Error in createRevenueFromShipments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Delete revenue from shipment
  static async deleteRevenueFromShipment(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { revenueId } = req.params;

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.deleteRevenueFromShipment(
        revenueId
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        message: "Revenue entry deleted successfully",
      });
    } catch (error: any) {
      console.error("Error in deleteRevenueFromShipment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Check for duplicates before import
  static async checkDuplicates(req: Request, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;
      const { shipments } = req.body;

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.checkDuplicates(
        brandId,
        shipments
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: "Duplicate check completed",
      });
    } catch (error: any) {
      console.error("Error in checkDuplicates:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Bulk delete shipments
  static async bulkDeleteShipments(req: Request, res: Response): Promise<void> {
    try {
      const { shipmentIds } = req.body;

      if (
        !shipmentIds ||
        !Array.isArray(shipmentIds) ||
        shipmentIds.length === 0
      ) {
        res.status(400).json({
          success: false,
          error: "Shipment IDs array is required",
        });
        return;
      }

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.bulkDeleteShipments(shipmentIds);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: `${
          result.data?.deletedCount || 0
        } shipments deleted successfully`,
      });
    } catch (error: any) {
      console.error("Error in bulkDeleteShipments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Bulk update shipment status
  static async bulkUpdateShipmentStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { shipmentIds, newStatus } = req.body;

      if (
        !shipmentIds ||
        !Array.isArray(shipmentIds) ||
        shipmentIds.length === 0
      ) {
        res.status(400).json({
          success: false,
          error: "Shipment IDs array is required",
        });
        return;
      }

      if (!newStatus) {
        res.status(400).json({
          success: false,
          error: "New status is required",
        });
        return;
      }

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.bulkUpdateShipmentStatus(
        shipmentIds,
        newStatus
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: `${
          result.data?.updatedCount || 0
        } shipments updated successfully`,
      });
    } catch (error: any) {
      console.error("Error in bulkUpdateShipmentStatus:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Bulk edit shipments
  static async bulkEditShipments(req: Request, res: Response): Promise<void> {
    try {
      const { shipmentIds, updates } = req.body;

      if (
        !shipmentIds ||
        !Array.isArray(shipmentIds) ||
        shipmentIds.length === 0
      ) {
        res.status(400).json({
          success: false,
          error: "Shipment IDs array is required",
        });
        return;
      }

      if (!updates || Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: "Updates object is required",
        });
        return;
      }

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.bulkEditShipments(
        shipmentIds,
        updates
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: `${
          result.data?.updatedCount || 0
        } shipments updated successfully`,
      });
    } catch (error: any) {
      console.error("Error in bulkEditShipments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  // Get grouped Bosta revenue
  static async getGroupedBostaRevenue(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { brandId } = req.params;

      const bostaImportService = new BostaImportService();
      const result = await bostaImportService.getGroupedBostaRevenue(brandId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: "Grouped Bosta revenue retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error in getGroupedBostaRevenue:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
