import { PrismaClient } from "@prisma/client";
import { CreateProjectTargetDto, UpdateProjectTargetDto } from "../types";

const prisma = new PrismaClient();

export class ProjectTargetsService {
  // Create project target
  static async createProjectTarget(
    data: CreateProjectTargetDto,
    createdBy: string
  ) {
    try {
      const processedData: any = {
        ...data,
        createdBy,
      };

      // Only add deadline if it's provided
      if (data.deadline) {
        processedData.deadline = new Date(data.deadline);
      }

      const projectTarget = await prisma.projectTarget.create({
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

      return projectTarget;
    } catch (error) {
      throw error;
    }
  }

  // Get all project targets for a brand
  static async getProjectTargets(
    brandId: string,
    filters?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const { search, status, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ];
      }

      const [projectTargets, total] = await Promise.all([
        prisma.projectTarget.findMany({
          where,
          select: {
            id: true,
            name: true,
            goal: true,
            targetPieces: true,
            currentPieces: true,
            category: true,
            deadline: true,
            status: true,
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
        prisma.projectTarget.count({ where }),
      ]);

      return {
        projectTargets,
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

  // Get project target by ID
  static async getProjectTargetById(id: string, brandId: string) {
    try {
      const projectTarget = await prisma.projectTarget.findFirst({
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

      if (!projectTarget) {
        throw new Error("Project target not found");
      }

      return projectTarget;
    } catch (error) {
      throw error;
    }
  }

  // Update project target
  static async updateProjectTarget(
    id: string,
    brandId: string,
    data: UpdateProjectTargetDto
  ) {
    try {
      const projectTarget = await prisma.projectTarget.findFirst({
        where: { id, brandId },
      });

      if (!projectTarget) {
        throw new Error("Project target not found");
      }

      const processedData: any = { ...data };

      // Only update deadline if it's provided
      if (data.deadline) {
        processedData.deadline = new Date(data.deadline);
      }

      const updatedProjectTarget = await prisma.projectTarget.update({
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

      return updatedProjectTarget;
    } catch (error) {
      throw error;
    }
  }

  // Delete project target
  static async deleteProjectTarget(id: string, brandId: string) {
    try {
      const projectTarget = await prisma.projectTarget.findFirst({
        where: { id, brandId },
      });

      if (!projectTarget) {
        throw new Error("Project target not found");
      }

      await prisma.projectTarget.delete({
        where: { id },
      });

      return { message: "Project target deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Get project target metrics
  static async getProjectTargetMetrics(brandId: string) {
    try {
      const [totalProjects, activeProjects, completedProjects] =
        await Promise.all([
          // Total projects
          prisma.projectTarget.count({
            where: { brandId },
          }),
          // Active projects
          prisma.projectTarget.count({
            where: {
              brandId,
              status: "active",
            },
          }),
          // Completed projects
          prisma.projectTarget.count({
            where: {
              brandId,
              status: "completed",
            },
          }),
        ]);

      return {
        totalProjects,
        activeProjects,
        completedProjects,
      };
    } catch (error) {
      throw error;
    }
  }
}
