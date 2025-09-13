import { Request, Response } from "express";
import { TeamTasksService } from "../../services/TeamTasksService";
import {
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
  CreateTaskDto,
  UpdateTaskDto,
} from "../../types";

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

export class TeamTasksController {
  // ===== TEAM =====

  // Create team member
  static async createTeamMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const data: CreateTeamMemberDto = {
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

      const teamMember = await TeamTasksService.createTeamMember(
        data,
        createdBy
      );

      return res.status(201).json({
        success: true,
        message: "Team member created successfully",
        data: teamMember,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create team member",
      });
    }
  }

  // Get all team members
  static async getTeamMembers(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { search, role, page, limit } = req.query;

      const filters = {
        search: search as string,
        role: role as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await TeamTasksService.getTeamMembers(brandId, filters);

      return res.status(200).json({
        success: true,
        message: "Team members retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve team members",
      });
    }
  }

  // Get team member by ID
  static async getTeamMemberById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const teamMember = await TeamTasksService.getTeamMemberById(id, brandId);

      return res.status(200).json({
        success: true,
        message: "Team member retrieved successfully",
        data: teamMember,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Team member not found",
      });
    }
  }

  // Update team member
  static async updateTeamMember(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdateTeamMemberDto = req.body;

      const teamMember = await TeamTasksService.updateTeamMember(
        id,
        brandId,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Team member updated successfully",
        data: teamMember,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update team member",
      });
    }
  }

  // Delete team member
  static async deleteTeamMember(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await TeamTasksService.deleteTeamMember(id, brandId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete team member",
      });
    }
  }

  // ===== TASKS =====

  // Create task
  static async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const data: CreateTaskDto = {
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

      const task = await TeamTasksService.createTask(data, createdBy);

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create task",
      });
    }
  }

  // Get all tasks
  static async getTasks(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { search, status, priority, page, limit } = req.query;

      const filters = {
        search: search as string,
        status: status as string,
        priority: priority as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await TeamTasksService.getTasks(brandId, filters);

      return res.status(200).json({
        success: true,
        message: "Tasks retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve tasks",
      });
    }
  }

  // Get task by ID
  static async getTaskById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const task = await TeamTasksService.getTaskById(id, brandId);

      return res.status(200).json({
        success: true,
        message: "Task retrieved successfully",
        data: task,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Task not found",
      });
    }
  }

  // Update task
  static async updateTask(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdateTaskDto = req.body;

      const task = await TeamTasksService.updateTask(id, brandId, data);

      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update task",
      });
    }
  }

  // Delete task
  static async deleteTask(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await TeamTasksService.deleteTask(id, brandId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete task",
      });
    }
  }

  // Get task metrics
  static async getTaskMetrics(req: Request, res: Response) {
    try {
      const { brandId } = req.params;

      const metrics = await TeamTasksService.getTaskMetrics(brandId);

      return res.status(200).json({
        success: true,
        message: "Task metrics retrieved successfully",
        data: metrics,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve task metrics",
      });
    }
  }
}
