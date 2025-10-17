"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardSummary } from "@/types";
import { dashboardService } from "@/services/dashboardService";

export function useDashboard(month?: Date) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getSummary(month);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard summary");
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}
