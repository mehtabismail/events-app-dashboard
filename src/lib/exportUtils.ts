// Export Utilities for Reports - CSV and Excel Download

/**
 * Escape CSV value - handles commas, quotes, and newlines
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If the value contains comma, newline, or double quote, wrap in quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"')
  ) {
    // Escape double quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T | string; label: string; format?: (value: unknown, row: T) => string }[]
): string {
  if (!data || data.length === 0) {
    return "";
  }

  // Create header row
  const headers = columns.map((col) => escapeCSVValue(col.label)).join(",");

  // Create data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        // Handle nested keys (e.g., "eventPlanner.name")
        const keys = String(col.key).split(".");
        let value: unknown = row;
        for (const key of keys) {
          value = (value as Record<string, unknown>)?.[key];
        }

        // Apply custom formatter if provided
        if (col.format) {
          value = col.format(value, row);
        }

        return escapeCSVValue(value);
      })
      .join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Download data as CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel to properly recognize UTF-8
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Download data as Excel file (XLSX format using CSV as base)
 * Note: For proper XLSX support, consider using a library like xlsx
 */
export function downloadExcel(csvContent: string, filename: string): void {
  // For true Excel format, we would need the xlsx library
  // For now, download as CSV with .xlsx extension (Excel can open it)
  // Excel will show a warning but will open the file correctly

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xlsx`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============================================
// Report-specific export configurations
// ============================================

import type {
  DashboardOverview,
  Transaction,
  EventReportItem,
  UserReportItem,
  EventPlannerReportItem,
} from "@/types/reports";

/**
 * Export Overview Report
 */
export function exportOverviewReport(data: DashboardOverview, format: "csv" | "excel" = "csv"): void {
  // Create summary rows
  const summaryData = [
    { category: "Users", metric: "Total Users", value: data.users.total },
    { category: "Users", metric: "New in Period", value: data.users.inPeriod },
    { category: "Users", metric: "Growth %", value: `${data.users.growth?.toFixed(1) || 0}%` },
    { category: "Event Planners", metric: "Total Event Planners", value: data.eventPlanners.total },
    { category: "Event Planners", metric: "New in Period", value: data.eventPlanners.inPeriod },
    { category: "Event Planners", metric: "Growth %", value: `${data.eventPlanners.growth?.toFixed(1) || 0}%` },
    { category: "Events", metric: "Total Events", value: data.events.total },
    { category: "Events", metric: "New in Period", value: data.events.inPeriod },
    { category: "Events", metric: "Growth %", value: `${data.events.growth?.toFixed(1) || 0}%` },
    { category: "Events", metric: "Draft Events", value: data.events.byStatus?.draft || 0 },
    { category: "Events", metric: "Pending Events", value: data.events.byStatus?.pending || 0 },
    { category: "Events", metric: "Approved Events", value: data.events.byStatus?.approved || 0 },
    { category: "Events", metric: "Suspended Events", value: data.events.byStatus?.suspended || 0 },
    { category: "Events", metric: "Rejected Events", value: data.events.byStatus?.rejected || 0 },
    { category: "Revenue", metric: "Total Revenue", value: data.revenue.totalFormatted },
    { category: "Revenue", metric: "Growth %", value: `${data.revenue.growth?.toFixed(1) || 0}%` },
    { category: "Revenue", metric: "Active Subscriptions", value: data.revenue.activeSubscriptions },
    { category: "Revenue", metric: "Total Subscriptions", value: data.revenue.totalSubscriptions },
    { category: "Engagement", metric: "Total Views", value: data.engagement.totalViews },
    { category: "Engagement", metric: "Unique Views", value: data.engagement.totalUniqueViews },
    { category: "Engagement", metric: "Likes", value: data.engagement.totalLikes },
    { category: "Engagement", metric: "Shares", value: data.engagement.totalShares },
    { category: "Engagement", metric: "Comments", value: data.engagement.totalComments },
    { category: "Engagement", metric: "RSVPs", value: data.engagement.totalRsvps },
    { category: "Engagement", metric: "Ticket Clicks", value: data.engagement.totalTicketRedirects },
  ];

  const columns = [
    { key: "category" as const, label: "Category" },
    { key: "metric" as const, label: "Metric" },
    { key: "value" as const, label: "Value" },
  ];

  const csvContent = arrayToCSV(summaryData, columns);
  const filename = `overview_report_${new Date().toISOString().split("T")[0]}`;

  if (format === "excel") {
    downloadExcel(csvContent, filename);
  } else {
    downloadCSV(csvContent, filename);
  }
}

/**
 * Export Payments Report
 */
export function exportPaymentsReport(
  transactions: Transaction[],
  format: "csv" | "excel" = "csv"
): void {
  const columns = [
    { key: "id", label: "Transaction ID" },
    {
      key: "eventPlanner.name",
      label: "Event Planner",
      format: (v: unknown) => String(v || "N/A"),
    },
    {
      key: "eventPlanner.email",
      label: "Planner Email",
      format: (v: unknown) => String(v || "N/A"),
    },
    {
      key: "event.name",
      label: "Event",
      format: (v: unknown) => String(v || "N/A"),
    },
    { key: "plan", label: "Plan" },
    { key: "amountFormatted", label: "Amount" },
    { key: "status", label: "Status" },
    {
      key: "currentPeriodStart",
      label: "Period Start",
      format: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "N/A"),
    },
    {
      key: "currentPeriodEnd",
      label: "Period End",
      format: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "N/A"),
    },
    {
      key: "createdAt",
      label: "Created At",
      format: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "N/A"),
    },
  ];

  const csvContent = arrayToCSV(transactions as unknown as Record<string, unknown>[], columns);
  const filename = `payments_report_${new Date().toISOString().split("T")[0]}`;

  if (format === "excel") {
    downloadExcel(csvContent, filename);
  } else {
    downloadCSV(csvContent, filename);
  }
}

/**
 * Export Events Report
 */
export function exportEventsReport(
  events: EventReportItem[],
  format: "csv" | "excel" = "csv"
): void {
  const columns = [
    { key: "id", label: "Event ID" },
    { key: "name", label: "Event Name" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "ticketPrice", label: "Ticket Price", format: (v: unknown) => `$${v || 0}` },
    {
      key: "dateTime",
      label: "Event Date",
      format: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "N/A"),
    },
    {
      key: "creator.name",
      label: "Creator",
      format: (v: unknown) => String(v || "N/A"),
    },
    {
      key: "creator.email",
      label: "Creator Email",
      format: (v: unknown) => String(v || "N/A"),
    },
    {
      key: "location.address",
      label: "Location",
      format: (v: unknown) => String(v || "N/A"),
    },
    {
      key: "metrics.views",
      label: "Views",
      format: (v: unknown) => String(v || 0),
    },
    {
      key: "metrics.likes",
      label: "Likes",
      format: (v: unknown) => String(v || 0),
    },
    {
      key: "metrics.comments",
      label: "Comments",
      format: (v: unknown) => String(v || 0),
    },
    {
      key: "metrics.shares",
      label: "Shares",
      format: (v: unknown) => String(v || 0),
    },
    {
      key: "metrics.rsvps.total",
      label: "RSVPs",
      format: (v: unknown) => String(v || 0),
    },
    {
      key: "createdAt",
      label: "Created At",
      format: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "N/A"),
    },
  ];

  const csvContent = arrayToCSV(events as unknown as Record<string, unknown>[], columns);
  const filename = `events_report_${new Date().toISOString().split("T")[0]}`;

  if (format === "excel") {
    downloadExcel(csvContent, filename);
  } else {
    downloadCSV(csvContent, filename);
  }
}

/**
 * Export Users Report
 */
export function exportUsersReport(
  users: UserReportItem[],
  format: "csv" | "excel" = "csv"
): void {
  const columns = [
    { key: "id", label: "User ID" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", format: (v: unknown) => String(v || "N/A") },
    { key: "address", label: "Address", format: (v: unknown) => String(v || "N/A") },
    {
      key: "createdAt",
      label: "Joined Date",
      format: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "N/A"),
    },
  ];

  const csvContent = arrayToCSV(users as unknown as Record<string, unknown>[], columns);
  const filename = `users_report_${new Date().toISOString().split("T")[0]}`;

  if (format === "excel") {
    downloadExcel(csvContent, filename);
  } else {
    downloadCSV(csvContent, filename);
  }
}

/**
 * Export Event Planners Report
 */
export function exportEventPlannersReport(
  eventPlanners: EventPlannerReportItem[],
  format: "csv" | "excel" = "csv"
): void {
  const columns = [
    { key: "id", label: "ID" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "companyName", label: "Company", format: (v: unknown) => String(v || "N/A") },
    { key: "phone", label: "Phone", format: (v: unknown) => String(v || "N/A") },
    { key: "events.total", label: "Total Events", format: (v: unknown) => String(v || 0) },
    { key: "events.approved", label: "Approved Events", format: (v: unknown) => String(v || 0) },
    { key: "events.pending", label: "Pending Events", format: (v: unknown) => String(v || 0) },
    { key: "revenue.totalFormatted", label: "Total Revenue", format: (v: unknown) => String(v || "$0.00") },
    {
      key: "revenue.activeSubscriptions",
      label: "Active Subscriptions",
      format: (v: unknown) => String(v || 0),
    },
    {
      key: "revenue.totalSubscriptions",
      label: "Total Subscriptions",
      format: (v: unknown) => String(v || 0),
    },
    {
      key: "createdAt",
      label: "Joined Date",
      format: (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "N/A"),
    },
  ];

  const csvContent = arrayToCSV(eventPlanners as unknown as Record<string, unknown>[], columns);
  const filename = `event_planners_report_${new Date().toISOString().split("T")[0]}`;

  if (format === "excel") {
    downloadExcel(csvContent, filename);
  } else {
    downloadCSV(csvContent, filename);
  }
}

