import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ITicket, ITicketResponse } from "../models/Ticket";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

class TicketController {
  // Create a new support ticket
  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, category, subject, description, userId } =
        req.body;

      // Validate required fields
      if (!fullName || !email || !category || !subject || !description) {
        res.status(400).json({
          success: false,
          message: "All required fields must be provided",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
        return;
      }

      // Validate category
      const validCategories = [
        "Billing",
        "Technical Issue",
        "Feature Request",
        "Account",
        "Other",
      ];
      if (!validCategories.includes(category)) {
        res.status(400).json({
          success: false,
          message: "Invalid category selected",
        });
        return;
      }

      // Handle file uploads
      const attachments = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          // Validate file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            res.status(400).json({
              success: false,
              message: `File ${file.originalname} exceeds 5MB limit`,
            });
            return;
          }

          // Validate file type
          const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
          ];
          if (!allowedTypes.includes(file.mimetype)) {
            res.status(400).json({
              success: false,
              message: `File type ${file.mimetype} is not allowed`,
            });
            return;
          }

          attachments.push({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/tickets/${file.filename}`,
          });
        }
      }

      // Generate unique ticket ID
      const ticketCount = await prisma.ticket.count();
      const ticketId = `TK-${String(ticketCount + 1).padStart(6, "0")}`;

      // Create ticket
      const ticket = await prisma.ticket.create({
        data: {
          ticketId,
          fullName,
          email,
          category,
          subject,
          description,
          attachments: attachments as any,
          userId: userId || null,
          priority: this.determinePriority(category, subject, description),
        },
      });

      // TODO: Send email notification to admin
      // await this.sendTicketNotification(ticket);

      res.status(201).json({
        success: true,
        message: "Ticket created successfully",
        data: {
          ticketId: ticket.ticketId,
          status: ticket.status,
          createdAt: ticket.createdAt,
        },
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create ticket",
      });
    }
  }

  // Get all tickets (admin only)
  async getAllTickets(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        category,
        priority,
        assignedTo,
        search,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query;

      const where: any = {};

      // Build filter query
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (assignedTo) where.assignedToId = assignedTo;

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      // Search filter
      if (search) {
        where.OR = [
          { subject: { contains: search as string, mode: "insensitive" } },
          { fullName: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
          { ticketId: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            responses: {
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: Number(limit),
        }),
        prisma.ticket.count({ where }),
      ]);

      console.log("Fetched tickets:", tickets.length);
      console.log("First ticket responses:", tickets[0]?.responses);

      res.json({
        success: true,
        data: {
          tickets,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total,
            limit: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
      });
    }
  }

  // Get user's own tickets
  async getUserTickets(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where: { userId },
          include: {
            responses: {
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: Number(limit),
        }),
        prisma.ticket.count({ where: { userId } }),
      ]);

      res.json({
        success: true,
        data: {
          tickets,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total,
            limit: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user tickets",
      });
    }
  }

  // Get ticket by ID
  async getTicketById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          responses: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
        return;
      }

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch ticket",
      });
    }
  }

  // Update ticket status
  async updateTicketStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, assignedTo } = req.body;
      const adminId = (req as any).admin?.id;

      const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
      if (status && !validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status",
        });
        return;
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (assignedTo) updateData.assignedToId = assignedTo;

      // Handle status change timestamps
      if (status === "Resolved") {
        updateData.resolvedAt = new Date();
      }
      if (status === "Closed") {
        updateData.closedAt = new Date();
      }

      const ticket = await prisma.ticket.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Add internal note about status change
      if (status) {
        const admin = await prisma.admin.findUnique({
          where: { id: adminId },
        });

        await prisma.ticketResponse.create({
          data: {
            ticketId: ticket.id,
            message: `Ticket status changed to ${status}`,
            isInternal: true,
            isFromAdmin: true,
            authorId: adminId,
            authorName: admin
              ? `${admin.firstName} ${admin.lastName}`
              : "System",
            authorEmail: admin?.email,
          },
        });
      }

      res.json({
        success: true,
        message: "Ticket updated successfully",
        data: ticket,
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update ticket",
      });
    }
  }

  // Add response to ticket
  async addResponse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { message, isInternal = false } = req.body;
      const adminId = (req as any).admin?.id;

      if (!message || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Message is required",
        });
        return;
      }

      const ticket = await prisma.ticket.findUnique({
        where: { id },
      });
      if (!ticket) {
        res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
        return;
      }

      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });
      if (!admin) {
        res.status(404).json({
          success: false,
          message: "Admin not found",
        });
        return;
      }

      // Handle file uploads for response
      const attachments = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          if (file.size > 5 * 1024 * 1024) {
            res.status(400).json({
              success: false,
              message: `File ${file.originalname} exceeds 5MB limit`,
            });
            return;
          }

          const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
          ];
          if (!allowedTypes.includes(file.mimetype)) {
            res.status(400).json({
              success: false,
              message: `File type ${file.mimetype} is not allowed`,
            });
            return;
          }

          attachments.push({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/tickets/${file.filename}`,
          });
        }
      }

      const response = await prisma.ticketResponse.create({
        data: {
          ticketId: ticket.id,
          message: message.trim(),
          isInternal,
          isFromAdmin: true,
          authorId: adminId,
          authorName: `${admin.firstName} ${admin.lastName}`,
          authorEmail: admin.email,
          attachments: attachments as any,
        },
      });

      console.log("Created response:", response);

      // TODO: Send email notification to user if not internal
      // if (!isInternal) {
      //   await this.sendResponseNotification(ticket, response);
      // }

      res.status(201).json({
        success: true,
        message: "Response added successfully",
        data: response,
      });
    } catch (error) {
      console.error("Error adding response:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add response",
      });
    }
  }

  // Get ticket statistics
  async getTicketStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        statusStats,
        categoryStats,
        priorityStats,
        totalTickets,
        openTickets,
        inProgressTickets,
      ] = await Promise.all([
        prisma.ticket.groupBy({
          by: ["status"],
          _count: {
            status: true,
          },
        }),
        prisma.ticket.groupBy({
          by: ["category"],
          _count: {
            category: true,
          },
        }),
        prisma.ticket.groupBy({
          by: ["priority"],
          _count: {
            priority: true,
          },
        }),
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: "Open" } }),
        prisma.ticket.count({ where: { status: "In Progress" } }),
      ]);

      res.json({
        success: true,
        data: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          statusBreakdown: statusStats.map((stat) => ({
            _id: stat.status,
            count: stat._count.status,
          })),
          categoryBreakdown: categoryStats.map((stat) => ({
            _id: stat.category,
            count: stat._count.category,
          })),
          priorityBreakdown: priorityStats.map((stat) => ({
            _id: stat.priority,
            count: stat._count.priority,
          })),
        },
      });
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch ticket statistics",
      });
    }
  }

  // Helper method to determine priority
  private determinePriority(
    category: string,
    subject: string,
    description: string
  ): string {
    const urgentKeywords = [
      "urgent",
      "critical",
      "emergency",
      "down",
      "broken",
      "not working",
    ];
    const highKeywords = ["important", "issue", "problem", "error", "bug"];

    const text = `${subject} ${description}`.toLowerCase();

    if (urgentKeywords.some((keyword) => text.includes(keyword))) {
      return "Urgent";
    }

    if (highKeywords.some((keyword) => text.includes(keyword))) {
      return "High";
    }

    if (category === "Billing") {
      return "High";
    }

    return "Medium";
  }
}

export default new TicketController();
