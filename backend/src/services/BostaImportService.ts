import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface BostaImportData {
  fileName: string;
  totalOrders: number;
  expectedCash: number;
  delivered: number;
  returned: number;
  returnRate: number;
  deliveryRate: number;
  shipments: BostaShipmentData[];
}

export interface BostaShipmentData {
  trackingNumber: string;
  deliveryState: string;
  codAmount: number;
  sku?: string;
  businessReference?: string;
  description?: string;
  consigneeName?: string;
  consigneePhone?: string;
  dropOffFirstLine?: string;
  dropOffCity?: string;
  deliveredAt?: string;
  updatedAt?: string;
  createdAt?: string;
  expectedDeliveryDate?: string;
}

export class BostaImportService {
  // Check for duplicate shipments before import
  async checkDuplicates(brandId: string, shipments: BostaShipmentData[]) {
    try {
      const trackingNumbers = shipments.map((s) => s.trackingNumber);

      const existingShipments = await prisma.bostaShipment.findMany({
        where: {
          trackingNumber: { in: trackingNumbers },
          import: { brandId },
        },
        select: {
          trackingNumber: true,
          deliveryState: true,
          codAmount: true,
          import: {
            select: {
              fileName: true,
              createdAt: true,
            },
          },
        },
      });

      const duplicates = shipments.filter((shipment) =>
        existingShipments.some(
          (existing) => existing.trackingNumber === shipment.trackingNumber
        )
      );

      return {
        success: true,
        data: {
          duplicates,
          existingShipments,
          duplicateCount: duplicates.length,
          totalCount: shipments.length,
        },
      };
    } catch (error: any) {
      console.error("Error checking duplicates:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Create a new Bosta import with shipments
  async createImport(brandId: string, data: BostaImportData) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create the import record
        const importRecord = await tx.bostaImport.create({
          data: {
            brandId,
            fileName: data.fileName,
            totalOrders: data.totalOrders,
            expectedCash: data.expectedCash,
            delivered: data.delivered,
            returned: data.returned,
            returnRate: data.returnRate,
            deliveryRate: data.deliveryRate,
            processedAt: new Date(),
          },
        });

        // Create shipment records
        const shipments = await Promise.all(
          data.shipments.map((shipment) =>
            tx.bostaShipment.create({
              data: {
                bostaImportId: importRecord.id,
                trackingNumber: shipment.trackingNumber,
                deliveryState: shipment.deliveryState,
                codAmount: shipment.codAmount,
                sku: shipment.sku,
                businessReference: shipment.businessReference,
                description: shipment.description,
                consigneeName: shipment.consigneeName,
                consigneePhone: shipment.consigneePhone,
                dropOffFirstLine: shipment.dropOffFirstLine,
                dropOffCity: shipment.dropOffCity,
                deliveredAt: shipment.deliveredAt
                  ? new Date(shipment.deliveredAt)
                  : null,
                originalUpdatedAt: shipment.updatedAt
                  ? new Date(shipment.updatedAt)
                  : null,
                originalCreatedAt: shipment.createdAt
                  ? new Date(shipment.createdAt)
                  : null,
                expectedDeliveryDate: shipment.expectedDeliveryDate
                  ? new Date(shipment.expectedDeliveryDate)
                  : null,
                isDelivered: shipment.deliveryState === "delivered",
                isReturned: shipment.deliveryState === "returned",
              },
            })
          )
        );

        return { import: importRecord, shipments };
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Error creating Bosta import:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get all imports for a brand with advanced filtering
  async getImports(
    brandId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      minAmount?: number;
      maxAmount?: number;
      city?: string;
      customer?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      console.log(
        "Getting imports for brandId:",
        brandId,
        "with options:",
        options
      );

      // Build where clause for filtering
      const whereClause: any = { brandId };

      // Add search filter
      if (options.search) {
        whereClause.OR = [
          { fileName: { contains: options.search, mode: "insensitive" } },
          {
            shipments: {
              some: {
                OR: [
                  {
                    trackingNumber: {
                      contains: options.search,
                      mode: "insensitive",
                    },
                  },
                  {
                    consigneeName: {
                      contains: options.search,
                      mode: "insensitive",
                    },
                  },
                  {
                    consigneePhone: {
                      contains: options.search,
                      mode: "insensitive",
                    },
                  },
                  { sku: { contains: options.search, mode: "insensitive" } },
                  {
                    businessReference: {
                      contains: options.search,
                      mode: "insensitive",
                    },
                  },
                  {
                    dropOffCity: {
                      contains: options.search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          },
        ];
      }

      // Add date range filter
      if (options.dateFrom || options.dateTo) {
        whereClause.createdAt = {};
        if (options.dateFrom) {
          whereClause.createdAt.gte = new Date(options.dateFrom);
        }
        if (options.dateTo) {
          whereClause.createdAt.lte = new Date(options.dateTo);
        }
      }

      // Add amount range filter
      if (options.minAmount || options.maxAmount) {
        whereClause.expectedCash = {};
        if (options.minAmount) {
          whereClause.expectedCash.gte = options.minAmount;
        }
        if (options.maxAmount) {
          whereClause.expectedCash.lte = options.maxAmount;
        }
      }

      // Add city filter
      if (options.city) {
        whereClause.shipments = {
          some: {
            dropOffCity: { contains: options.city, mode: "insensitive" },
          },
        };
      }

      // Add customer filter
      if (options.customer) {
        whereClause.shipments = {
          some: {
            consigneeName: { contains: options.customer, mode: "insensitive" },
          },
        };
      }

      // Add status filter
      if (options.status) {
        whereClause.shipments = {
          some: {
            deliveryState: options.status,
          },
        };
      }

      // Build order by clause
      const orderBy: any = {};
      if (options.sortBy) {
        orderBy[options.sortBy] = options.sortOrder || "desc";
      } else {
        orderBy.createdAt = "desc";
      }

      const [imports, total] = await Promise.all([
        prisma.bostaImport.findMany({
          where: whereClause,
          include: {
            shipments: {
              select: {
                id: true,
                trackingNumber: true,
                deliveryState: true,
                codAmount: true,
                isDelivered: true,
                isReturned: true,
                revenueCreated: true,
                consigneeName: true,
                dropOffCity: true,
                sku: true,
                businessReference: true,
              },
            },
            revenues: {
              select: {
                id: true,
                name: true,
                amount: true,
                date: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.bostaImport.count({
          where: whereClause,
        }),
      ]);

      console.log("Found imports:", imports.length, "total:", total);

      return {
        success: true,
        data: {
          imports,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error: any) {
      console.error("Error getting Bosta imports:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get specific import with all details
  async getImportById(importId: string) {
    try {
      const importRecord = await prisma.bostaImport.findUnique({
        where: { id: importId },
        include: {
          shipments: {
            include: {
              revenues: true,
            },
          },
          revenues: true,
        },
      });

      if (!importRecord) {
        return {
          success: false,
          error: "Import not found",
        };
      }

      return {
        success: true,
        data: importRecord,
      };
    } catch (error: any) {
      console.error("Error getting Bosta import:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Create revenue entries for delivered shipments
  async createRevenueFromShipments(
    brandId: string,
    importId: string,
    shipmentIds: string[],
    userId: string
  ) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get the shipments
        const shipments = await tx.bostaShipment.findMany({
          where: {
            id: { in: shipmentIds },
            bostaImportId: importId,
            isDelivered: true,
            codAmount: { gt: 0 },
          },
        });

        // Create revenue entries
        const revenues = await Promise.all(
          shipments.map((shipment) =>
            tx.revenue.create({
              data: {
                brandId,
                name: `Bosta Delivery - ${shipment.trackingNumber}`,
                amount: shipment.codAmount,
                category: "Delivery",
                date:
                  shipment.deliveredAt ||
                  shipment.originalUpdatedAt ||
                  new Date(),
                source: "Bosta Import",
                createdBy: userId,
                bostaImportId: importId,
                bostaShipmentId: shipment.id,
              },
            })
          )
        );

        // Update shipment records to mark revenue as created
        await tx.bostaShipment.updateMany({
          where: {
            id: { in: shipmentIds },
          },
          data: {
            revenueCreated: true,
          },
        });

        return revenues;
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Error creating revenue from shipments:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete revenue entry and update shipment
  async deleteRevenueFromShipment(revenueId: string) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get the revenue entry
        const revenue = await tx.revenue.findUnique({
          where: { id: revenueId },
          include: {
            bostaShipment: true,
          },
        });

        if (!revenue || !revenue.bostaShipmentId) {
          throw new Error("Revenue not found or not linked to shipment");
        }

        // Delete the revenue
        await tx.revenue.delete({
          where: { id: revenueId },
        });

        // Update shipment to mark revenue as not created
        await tx.bostaShipment.update({
          where: { id: revenue.bostaShipmentId },
          data: {
            revenueCreated: false,
          },
        });

        return { success: true };
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Error deleting revenue from shipment:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Bulk delete shipments
  async bulkDeleteShipments(shipmentIds: string[]) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Delete associated revenue entries first
        await tx.revenue.deleteMany({
          where: {
            bostaShipmentId: { in: shipmentIds },
          },
        });

        // Delete shipments
        const deletedShipments = await tx.bostaShipment.deleteMany({
          where: {
            id: { in: shipmentIds },
          },
        });

        return deletedShipments;
      });

      return {
        success: true,
        data: { deletedCount: result.count },
      };
    } catch (error: any) {
      console.error("Error bulk deleting shipments:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Bulk update shipment status
  async bulkUpdateShipmentStatus(shipmentIds: string[], newStatus: string) {
    try {
      const result = await prisma.bostaShipment.updateMany({
        where: {
          id: { in: shipmentIds },
        },
        data: {
          deliveryState: newStatus,
          isDelivered: newStatus === "delivered",
          isReturned: newStatus === "returned",
        },
      });

      return {
        success: true,
        data: { updatedCount: result.count },
      };
    } catch (error: any) {
      console.error("Error bulk updating shipment status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Bulk edit shipment fields
  async bulkEditShipments(
    shipmentIds: string[],
    updates: Partial<BostaShipmentData>
  ) {
    try {
      const updateData: any = {};

      if (updates.consigneeName)
        updateData.consigneeName = updates.consigneeName;
      if (updates.consigneePhone)
        updateData.consigneePhone = updates.consigneePhone;
      if (updates.dropOffCity) updateData.dropOffCity = updates.dropOffCity;
      if (updates.dropOffFirstLine)
        updateData.dropOffFirstLine = updates.dropOffFirstLine;
      if (updates.sku) updateData.sku = updates.sku;
      if (updates.businessReference)
        updateData.businessReference = updates.businessReference;
      if (updates.description) updateData.description = updates.description;

      const result = await prisma.bostaShipment.updateMany({
        where: {
          id: { in: shipmentIds },
        },
        data: updateData,
      });

      return {
        success: true,
        data: { updatedCount: result.count },
      };
    } catch (error: any) {
      console.error("Error bulk editing shipments:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get grouped revenue entries for Bosta imports
  async getGroupedBostaRevenue(brandId: string) {
    try {
      const groupedRevenue = await prisma.revenue.findMany({
        where: {
          brandId,
          bostaImportId: { not: null },
        },
        include: {
          bostaImport: {
            select: {
              id: true,
              fileName: true,
              createdAt: true,
            },
          },
          bostaShipment: {
            select: {
              id: true,
              trackingNumber: true,
              deliveryState: true,
              codAmount: true,
            },
          },
        },
        orderBy: [{ bostaImportId: "asc" }, { createdAt: "desc" }],
      });

      // Group by import
      const grouped = groupedRevenue.reduce((acc, revenue) => {
        const importId = revenue.bostaImportId!;
        if (!acc[importId]) {
          acc[importId] = {
            import: revenue.bostaImport!,
            revenues: [],
            totalAmount: 0,
          };
        }
        acc[importId].revenues.push(revenue);
        acc[importId].totalAmount += revenue.amount;
        return acc;
      }, {} as Record<string, any>);

      return {
        success: true,
        data: Object.values(grouped),
      };
    } catch (error: any) {
      console.error("Error getting grouped Bosta revenue:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
