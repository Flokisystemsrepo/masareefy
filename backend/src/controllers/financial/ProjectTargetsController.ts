import { Request, Response } from "express";
import { ProjectTargetsService } from "../../services/ProjectTargetsService";
import { CreateProjectTargetDto, UpdateProjectTargetDto } from "../../types";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class ProjectTargetsController {
  // Create project target
  static async createProjectTarget(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const data: CreateProjectTargetDto = {
        ...req.body,
        brandId,
      };
      const createdBy = req.user?.id;

      if (!createdBy) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const projectTarget = await ProjectTargetsService.createProjectTarget(
        data,
        createdBy
      );

      return res.status(201).json({
        success: true,
        message: "Project target created successfully",
        data: projectTarget,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create project target",
      });
    }
  }

  // Get all project targets
  static async getProjectTargets(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { search, status, page, limit } = req.query;

      const filters = {
        search: search as string,
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await ProjectTargetsService.getProjectTargets(
        brandId,
        filters
      );

      return res.status(200).json({
        success: true,
        message: "Project targets retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve project targets",
      });
    }
  }

  // Get project target by ID
  static async getProjectTargetById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const projectTarget = await ProjectTargetsService.getProjectTargetById(
        id,
        brandId
      );

      return res.status(200).json({
        success: true,
        message: "Project target retrieved successfully",
        data: projectTarget,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Project target not found",
      });
    }
  }

  // Update project target
  static async updateProjectTarget(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdateProjectTargetDto = req.body;

      const projectTarget = await ProjectTargetsService.updateProjectTarget(
        id,
        brandId,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Project target updated successfully",
        data: projectTarget,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update project target",
      });
    }
  }

  // Delete project target
  static async deleteProjectTarget(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await ProjectTargetsService.deleteProjectTarget(
        id,
        brandId
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete project target",
      });
    }
  }

  // Get project target metrics
  static async getProjectTargetMetrics(req: Request, res: Response) {
    try {
      const { brandId } = req.params;

      const metrics = await ProjectTargetsService.getProjectTargetMetrics(
        brandId
      );

      return res.status(200).json({
        success: true,
        message: "Project target metrics retrieved successfully",
        data: metrics,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve project target metrics",
      });
    }
  }
}
