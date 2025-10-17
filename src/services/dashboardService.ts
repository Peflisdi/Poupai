import { DashboardSummary } from "@/types";

export const dashboardService = {
  // GET dashboard summary
  async getSummary(month?: Date): Promise<DashboardSummary> {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toISOString());

    const response = await fetch(`/api/dashboard?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch dashboard summary");

    const data = await response.json();
    return data;
  },

  // GET expenses by category for chart
  async getExpensesByCategory(startDate?: Date, endDate?: Date) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await fetch(`/api/dashboard/expenses-by-category?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch expenses by category");

    const data = await response.json();
    return data.data;
  },

  // GET timeline data for chart
  async getTimeline(days: number = 30) {
    const response = await fetch(`/api/dashboard/timeline?days=${days}`);
    if (!response.ok) throw new Error("Failed to fetch timeline");

    const data = await response.json();
    return data.data;
  },
};
