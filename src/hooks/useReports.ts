import { useState, useCallback } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import {
  Period,
  DashboardOverview,
  PaymentsReportData,
  PaymentsQueryParams,
  EventsReportData,
  EventsQueryParams,
  UsersReportData,
  EventPlannersReportData,
  ReportQueryParams,
  ChartData,
} from "@/types/reports";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Generic fetch function
async function fetchReport<T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${BASE_URL}${endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    console.log("Fetching report from:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        data: null,
        error: errorData.message || `Failed to fetch report (${res.status})`,
      };
    }

    const data = await res.json();
    return { success: true, data: data.data || data, error: null };
  } catch (err) {
    console.error("Report fetch error:", err);
    return { success: false, data: null, error: "Network error" };
  }
}

// Dashboard Overview Hook
export function useReportsDashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (period: Period = "month") => {
    setLoading(true);
    setError(null);

    const result = await fetchReport<DashboardOverview>(
      API_ENDPOINTS.reports_dashboard,
      { period }
    );

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error);
      toast.error(result.error || "Failed to fetch dashboard");
    }

    setLoading(false);
    return result;
  }, []);

  return { data, loading, error, fetchDashboard };
}

// Payments Report Hook
export function useReportsPayments() {
  const [data, setData] = useState<PaymentsReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (params?: PaymentsQueryParams) => {
    setLoading(true);
    setError(null);

    const result = await fetchReport<PaymentsReportData>(
      API_ENDPOINTS.reports_payments,
      params as Record<string, unknown>
    );

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error);
      toast.error(result.error || "Failed to fetch payments report");
    }

    setLoading(false);
    return result;
  }, []);

  return { data, loading, error, fetchPayments };
}

// Events Report Hook
export function useReportsEvents() {
  const [data, setData] = useState<EventsReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (params?: EventsQueryParams) => {
    setLoading(true);
    setError(null);

    const result = await fetchReport<EventsReportData>(
      API_ENDPOINTS.reports_events,
      { ...params, includeMetrics: true } as Record<string, unknown>
    );

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error);
      toast.error(result.error || "Failed to fetch events report");
    }

    setLoading(false);
    return result;
  }, []);

  return { data, loading, error, fetchEvents };
}

// Users Report Hook
export function useReportsUsers() {
  const [data, setData] = useState<UsersReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (params?: ReportQueryParams) => {
    setLoading(true);
    setError(null);

    const result = await fetchReport<UsersReportData>(
      API_ENDPOINTS.reports_users,
      params as Record<string, unknown>
    );

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error);
      toast.error(result.error || "Failed to fetch users report");
    }

    setLoading(false);
    return result;
  }, []);

  return { data, loading, error, fetchUsers };
}

// Event Planners Report Hook
export function useReportsEventPlanners() {
  const [data, setData] = useState<EventPlannersReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventPlanners = useCallback(async (params?: ReportQueryParams) => {
    setLoading(true);
    setError(null);

    const result = await fetchReport<EventPlannersReportData>(
      API_ENDPOINTS.reports_event_planners,
      params as Record<string, unknown>
    );

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error);
      toast.error(result.error || "Failed to fetch event planners report");
    }

    setLoading(false);
    return result;
  }, []);

  return { data, loading, error, fetchEventPlanners };
}

// Charts Hook
export function useReportsCharts() {
  const [revenueChart, setRevenueChart] = useState<ChartData | null>(null);
  const [registrationsChart, setRegistrationsChart] =
    useState<ChartData | null>(null);
  const [eventsChart, setEventsChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueChart = useCallback(async (period: Period = "month") => {
    const result = await fetchReport<{ chartData: ChartData }>(
      API_ENDPOINTS.charts_revenue,
      { period }
    );

    if (result.success && result.data) {
      setRevenueChart(result.data.chartData);
    }
    return result;
  }, []);

  const fetchRegistrationsChart = useCallback(
    async (
      period: Period = "month",
      type: "users" | "event-planners" | "all" = "all"
    ) => {
      const result = await fetchReport<{ chartData: ChartData }>(
        API_ENDPOINTS.charts_registrations,
        { period, type }
      );

      if (result.success && result.data) {
        setRegistrationsChart(result.data.chartData);
      }
      return result;
    },
    []
  );

  const fetchEventsChart = useCallback(async (period: Period = "month") => {
    const result = await fetchReport<{ chartData: ChartData }>(
      API_ENDPOINTS.charts_events,
      { period }
    );

    if (result.success && result.data) {
      setEventsChart(result.data.chartData);
    }
    return result;
  }, []);

  const fetchAllCharts = useCallback(
    async (period: Period = "month") => {
      setLoading(true);
      setError(null);

      try {
        // Call the chart fetch functions directly without dependencies
        // Use Promise.allSettled to continue even if some fail (404s)
        const results = await Promise.allSettled([
          fetchReport<{ chartData: ChartData }>(
            API_ENDPOINTS.charts_revenue,
            { period }
          ),
          fetchReport<{ chartData: ChartData }>(
            API_ENDPOINTS.charts_registrations,
            { period, type: "all" }
          ),
          fetchReport<{ chartData: ChartData }>(
            API_ENDPOINTS.charts_events,
            { period }
          ),
        ]);

        // Handle revenue chart (silently fail if 404)
        if (results[0].status === "fulfilled" && results[0].value.success && results[0].value.data) {
          setRevenueChart(results[0].value.data.chartData);
        } else if (results[0].status === "rejected" || (results[0].status === "fulfilled" && !results[0].value.success)) {
          console.warn("Revenue chart API not available (404 or error)");
        }

        // Handle registrations chart (silently fail if 404)
        if (results[1].status === "fulfilled" && results[1].value.success && results[1].value.data) {
          setRegistrationsChart(results[1].value.data.chartData);
        } else if (results[1].status === "rejected" || (results[1].status === "fulfilled" && !results[1].value.success)) {
          console.warn("Registrations chart API not available (404 or error)");
        }

        // Handle events chart (silently fail if 404)
        if (results[2].status === "fulfilled" && results[2].value.success && results[2].value.data) {
          setEventsChart(results[2].value.data.chartData);
        } else if (results[2].status === "rejected" || (results[2].status === "fulfilled" && !results[2].value.success)) {
          console.warn("Events chart API not available (404 or error)");
        }
      } catch (err) {
        console.error("Failed to fetch charts:", err);
        // Don't set error or show toast for chart errors as they might not be critical
      }

      setLoading(false);
    },
    [] // No dependencies to prevent infinite loops
  );

  return {
    revenueChart,
    registrationsChart,
    eventsChart,
    loading,
    error,
    fetchRevenueChart,
    fetchRegistrationsChart,
    fetchEventsChart,
    fetchAllCharts,
  };
}
