import { Category, CategoryFormData } from "@/types";

export const categoryService = {
  // GET all categories
  async getAll(): Promise<Category[]> {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Failed to fetch categories");

    const data = await response.json();
    return data;
  },

  // GET single category
  async getById(id: string): Promise<Category> {
    const response = await fetch(`/api/categories/${id}`);
    if (!response.ok) throw new Error("Failed to fetch category");

    const data = await response.json();
    return data;
  },

  // POST create category
  async create(data: CategoryFormData): Promise<Category> {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create category");
    }

    const result = await response.json();
    return result;
  },

  // PUT update category
  async update(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    const response = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update category");
    }

    const result = await response.json();
    return result;
  },

  // DELETE category
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete category");
    }
  },
};
