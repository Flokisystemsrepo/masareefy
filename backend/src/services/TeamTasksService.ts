import { PrismaClient } from "@prisma/client";
import {
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
  CreateTaskDto,
  UpdateTaskDto,
} from "../types";

const prisma = new PrismaClient();

export class TeamTasksService {
  // ===== TEAM =====

  // Create team member
  static async createTeamMember(data: CreateTeamMemberDto, createdBy: string) {
    try {
      const processedData = {
        brandId: data.brandId,
        userId: data.userId || createdBy, // Use provided userId or createdBy
        role: data.role,
        permissions: data.permissions,
      };

      const teamMember = await prisma.teamMember.create({
        data: processedData,
        include: {
          brand: true,
        },
      });

      return teamMember;
    } catch (error) {
      throw error;
    }
  }

  // Get all team members for a brand
  static async getTeamMembers(
    brandId: string,
    filters?: {
      search?: string;
      role?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const { search, role, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (role) {
        where.role = role;
      }

      const [teamMembers, total] = await Promise.all([
        prisma.teamMember.findMany({
          where,
          select: {
            id: true,
            userId: true,
            role: true,
            permissions: true,
            joinedAt: true,
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { joinedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.teamMember.count({ where }),
      ]);

      return {
        teamMembers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get team member by ID
  static async getTeamMemberById(id: string, brandId: string) {
    try {
      const teamMember = await prisma.teamMember.findFirst({
        where: { id, brandId },
        include: {
          brand: true,
        },
      });

      if (!teamMember) {
        throw new Error("Team member not found");
      }

      return teamMember;
    } catch (error) {
      throw error;
    }
  }

  // Update team member
  static async updateTeamMember(
    id: string,
    brandId: string,
    data: UpdateTeamMemberDto
  ) {
    try {
      const teamMember = await prisma.teamMember.findFirst({
        where: { id, brandId },
      });

      if (!teamMember) {
        throw new Error("Team member not found");
      }

      const updatedTeamMember = await prisma.teamMember.update({
        where: { id },
        data,
        include: {
          brand: true,
        },
      });

      return updatedTeamMember;
    } catch (error) {
      throw error;
    }
  }

  // Delete team member
  static async deleteTeamMember(id: string, brandId: string) {
    try {
      const teamMember = await prisma.teamMember.findFirst({
        where: { id, brandId },
      });

      if (!teamMember) {
        throw new Error("Team member not found");
      }

      await prisma.teamMember.delete({
        where: { id },
      });

      return { message: "Team member deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // ===== TASKS =====

  // Create task
  static async createTask(data: CreateTaskDto, createdBy: string) {
    try {
      const processedData: any = {
        brandId: data.brandId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: "pending", // Set default status
        assignedTo: data.assignedTo,
        category: data.category,
        createdBy,
      };

      // Only add dueDate if it's provided
      if (data.dueDate) {
        processedData.dueDate = new Date(data.dueDate);
      }

      const task = await prisma.task.create({
        data: processedData,
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Get all tasks for a brand
  static async getTasks(
    brandId: string,
    filters?: {
      search?: string;
      status?: string;
      priority?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const { search, status, priority, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            dueDate: true,
            assignedTo: true,
            category: true,
            createdAt: true,
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.task.count({ where }),
      ]);

      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get task by ID
  static async getTaskById(id: string, brandId: string) {
    try {
      const task = await prisma.task.findFirst({
        where: { id, brandId },
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Update task
  static async updateTask(id: string, brandId: string, data: UpdateTaskDto) {
    try {
      const task = await prisma.task.findFirst({
        where: { id, brandId },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const processedData: any = { ...data };

      // Only update dueDate if it's provided
      if (data.dueDate) {
        processedData.dueDate = new Date(data.dueDate);
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: processedData,
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return updatedTask;
    } catch (error) {
      throw error;
    }
  }

  // Delete task
  static async deleteTask(id: string, brandId: string) {
    try {
      const task = await prisma.task.findFirst({
        where: { id, brandId },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      await prisma.task.delete({
        where: { id },
      });

      return { message: "Task deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Get task metrics
  static async getTaskMetrics(brandId: string) {
    try {
      const [totalTasks, pendingTasks, completedTasks] = await Promise.all([
        // Total tasks
        prisma.task.count({
          where: { brandId },
        }),
        // Pending tasks
        prisma.task.count({
          where: {
            brandId,
            status: "pending",
          },
        }),
        // Completed tasks
        prisma.task.count({
          where: {
            brandId,
            status: "completed",
          },
        }),
      ]);

      return {
        totalTasks,
        pendingTasks,
        completedTasks,
      };
    } catch (error) {
      throw error;
    }
  }
}
