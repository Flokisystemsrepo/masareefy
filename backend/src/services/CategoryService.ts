import { prisma } from "@/config/database";

export class CategoryService {
  // Create category
  static async createCategory(data: {
    brandId: string;
    name: string;
    color: string;
    type: string;
  }) {
    try {
      const category = await prisma.category.create({
        data,
      });

      return category;
    } catch (error) {
      throw error;
    }
  }

  // Get all categories for a brand
  static async getCategories(brandId: string, type?: string) {
    try {
      const where: any = { brandId };

      if (type) {
        where.type = type;
      }

      const categories = await prisma.category.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return categories;
    } catch (error) {
      throw error;
    }
  }

  // Get category by ID
  static async getCategoryById(id: string, brandId: string) {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id,
          brandId,
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    } catch (error) {
      throw error;
    }
  }

  // Update category
  static async updateCategory(id: string, brandId: string, updateData: any) {
    try {
      const category = await prisma.category.updateMany({
        where: {
          id,
          brandId,
        },
        data: updateData,
      });

      if (category.count === 0) {
        throw new Error("Category not found");
      }

      return await this.getCategoryById(id, brandId);
    } catch (error) {
      throw error;
    }
  }

  // Delete category
  static async deleteCategory(id: string, brandId: string) {
    try {
      const result = await prisma.category.deleteMany({
        where: {
          id,
          brandId,
        },
      });

      if (result.count === 0) {
        throw new Error("Category not found");
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get categories used in revenues/costs (for dropdown)
  static async getUsedCategories(brandId: string, type: string) {
    try {
      // Get all unique categories from revenues or costs
      let usedCategories: string[] = [];

      if (type === "revenue") {
        const revenueCategories = await prisma.revenue.findMany({
          where: { brandId },
          select: { category: true },
          distinct: ["category"],
        });
        usedCategories = revenueCategories.map((r) => r.category);
      } else if (type === "cost") {
        const costCategories = await prisma.cost.findMany({
          where: { brandId },
          select: { category: true },
          distinct: ["category"],
        });
        usedCategories = costCategories.map((c) => c.category);
      }

      // Get managed categories from the categories table
      const managedCategories = await prisma.category.findMany({
        where: {
          brandId,
          type: type === "revenue" ? "revenue" : "cost",
        },
        select: { name: true, color: true },
      });

      // Combine managed categories with used categories that aren't managed
      const managedCategoryNames = managedCategories.map((c) => c.name);
      const unmanagedCategories = usedCategories
        .filter((cat) => !managedCategoryNames.includes(cat))
        .map((cat) => ({
          name: cat,
          color: "bg-gray-100 text-gray-800",
        }));

      return [...managedCategories, ...unmanagedCategories];
    } catch (error) {
      throw error;
    }
  }
}
