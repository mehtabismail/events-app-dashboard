"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  useReportsDashboard,
  useReportsPayments,
  useReportsEvents,
  useReportsUsers,
  useReportsEventPlanners,
  useReportsCharts,
} from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Period,
  Transaction,
  EventReportItem,
  UserReportItem,
  EventPlannerReportItem,
  ChartData,
} from "@/types/reports";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Users2,
  UserCog,
  CalendarCheck2,
  DollarSign,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Ticket,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  Activity,
  Target,
  Building2,
  Phone,
  MapPin,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import {
  exportOverviewReport,
  exportPaymentsReport,
  exportEventsReport,
  exportUsersReport,
  exportEventPlannersReport,
} from "@/lib/exportUtils";

// Tab types
type ReportTab =
  | "overview"
  | "payments"
  | "events"
  | "users"
  | "event-planners";

// Period options
const periodOptions: { value: Period; label: string }[] = [
  { value: "week", label: "7 Days" },
  { value: "month", label: "30 Days" },
  { value: "year", label: "12 Months" },
  { value: "all", label: "All Time" },
];

// Tab options
const tabOptions: {
  value: ReportTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "overview", label: "Overview", icon: BarChart2 },
  { value: "payments", label: "Payments", icon: CreditCard },
  { value: "events", label: "Events", icon: CalendarCheck2 },
  { value: "users", label: "Users", icon: Users2 },
  { value: "event-planners", label: "Event Planners", icon: UserCog },
];

// Stat Card Component
function StatCard({
  title,
  value,
  growth,
  icon: Icon,
  color,
  prefix = "",
}: {
  title: string;
  value: number | string;
  growth?: number;
  icon: React.ElementType;
  color: string;
  prefix?: string;
}) {
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {growth !== undefined && (
            <div
              className={cn(
                "flex items-center mt-2 text-sm font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{Math.abs(growth).toFixed(1)}% vs previous period</span>
            </div>
          )}
        </div>
        <div className={cn("p-4 rounded-full", color)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Mini Stat Component
function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <Icon className="w-5 h-5 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

// Simple Bar Chart Component
function SimpleBarChart({
  data,
  title,
  color = "#1F9BB7",
}: {
  data: ChartData | null;
  title: string;
  color?: string;
}) {
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="h-48 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const dataset = data.datasets[0];
  const chartHeight = 192; // h-48 = 192px
  const maxValue = Math.max(...dataset.data, 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="relative h-48 flex items-end justify-between gap-1 px-2">
        {data.labels.map((label, index) => {
          const value = dataset.data[index] || 0;
          // Calculate height in pixels based on maxValue
          const heightPx = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
          // Ensure minimum height for visibility (at least 2px if value > 0)
          const finalHeight = value > 0 ? Math.max(heightPx, 2) : 0;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Bar Container - positioned from bottom */}
              <div
                className="relative w-full flex justify-center mb-2"
                style={{ height: `${chartHeight}px` }}
              >
                {/* Bar */}
                <div
                  className="absolute bottom-0 w-full max-w-8 rounded-t-md transition-all duration-300 group-hover:opacity-80 group-hover:scale-105"
                  style={{
                    height: `${finalHeight}px`,
                    minHeight: value > 0 ? "2px" : "0px",
                    backgroundColor: color,
                  }}
                />
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {value.toLocaleString()}
                </div>
              </div>
              {/* Label */}
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center mt-1">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    canceled: "bg-gray-100 text-gray-800 border-gray-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    suspended: "bg-orange-100 text-orange-800 border-orange-200",
    past_due: "bg-red-100 text-red-800 border-red-200",
    unpaid: "bg-red-100 text-red-800 border-red-200",
    draft: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium border capitalize",
        colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

// Download Dropdown Component
function DownloadDropdown({
  onDownload,
  disabled = false,
  label = "Download",
}: {
  onDownload: (format: "csv" | "excel") => void;
  disabled?: boolean;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        disabled={disabled}
        className="hover:bg-[#1F9BB7]/10 border-[#1F9BB7] text-[#1F9BB7]"
      >
        <Download className="w-4 h-4 mr-2" />
        {label}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <button
            onClick={() => {
              onDownload("csv");
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
          >
            <Download className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-medium">Download CSV</p>
              <p className="text-xs text-gray-500">Comma-separated values</p>
            </div>
          </button>
          <button
            onClick={() => {
              onDownload("excel");
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-t border-gray-200 dark:border-gray-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-medium">Download Excel</p>
              <p className="text-xs text-gray-500">Microsoft Excel format</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// Pagination Component
function ReportPagination({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || loading}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      <div className="flex gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                currentPage === pageNum
                  ? "bg-[#1F9BB7] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

// Overview Tab Content
function OverviewTabContent({
  dashboard,
  charts,
  loading,
}: {
  dashboard: ReturnType<typeof useReportsDashboard>;
  charts: ReturnType<typeof useReportsCharts>;
  loading: boolean;
}) {
  const data = dashboard.data;

  if (loading || dashboard.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1F9BB7]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No data available. Try refreshing the page.</p>
      </div>
    );
  }

  // Handle download
  const handleDownload = (format: "csv" | "excel") => {
    if (data) {
      exportOverviewReport(data, format);
    }
  };

  return (
    <div className="space-y-8">
      {/* Date Range Info & Download */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing data from{" "}
          <span className="font-medium">
            {new Date(data.dateRange.start).toLocaleDateString()}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {new Date(data.dateRange.end).toLocaleDateString()}
          </span>
        </div>
        <DownloadDropdown
          onDownload={handleDownload}
          disabled={!data}
          label="Export Overview"
        />
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={data.users.total}
          growth={data.users.growth}
          icon={Users2}
          color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Event Planners"
          value={data.eventPlanners.total}
          growth={data.eventPlanners.growth}
          icon={UserCog}
          color="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Total Events"
          value={data.events.total}
          growth={data.events.growth}
          icon={CalendarCheck2}
          color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Total Revenue"
          value={data.revenue.totalFormatted}
          growth={data.revenue.growth}
          icon={DollarSign}
          color="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={charts.revenueChart}
          title="Revenue Trend"
          color="#F59E0B"
        />
        <SimpleBarChart
          data={charts.registrationsChart}
          title="User Registrations"
          color="#1F9BB7"
        />
      </div>

      {/* Events by Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Events by Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(data.events.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <StatusBadge status={status} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Engagement Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <MiniStat
            label="Views"
            value={data.engagement.totalViews}
            icon={Eye}
          />
          <MiniStat
            label="Unique Views"
            value={data.engagement.totalUniqueViews}
            icon={Target}
          />
          <MiniStat
            label="Likes"
            value={data.engagement.totalLikes}
            icon={Heart}
          />
          <MiniStat
            label="Shares"
            value={data.engagement.totalShares}
            icon={Share2}
          />
          <MiniStat
            label="Comments"
            value={data.engagement.totalComments}
            icon={MessageCircle}
          />
          <MiniStat
            label="RSVPs"
            value={data.engagement.totalRsvps}
            icon={Calendar}
          />
          <MiniStat
            label="Ticket Clicks"
            value={data.engagement.totalTicketRedirects}
            icon={Ticket}
          />
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue by Plan
          </h3>
          <div className="space-y-4">
            {data.revenue.byPlan.map((plan) => (
              <div
                key={plan.plan}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {plan.plan} Plan
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.count} subscriptions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.revenueFormatted}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subscription Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.revenue.activeSubscriptions}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Subscriptions
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.revenue.totalSubscriptions}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Subscriptions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payments Tab Content
function PaymentsTabContent() {
  const { data, loading, fetchPayments } = useReportsPayments();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "" as "" | "active" | "canceled" | "past_due" | "unpaid",
    plan: "" as "" | "weekly" | "monthly",
    search: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // Convert empty strings to undefined for the API call
    const apiFilters = {
      page: filters.page,
      limit: filters.limit,
      status: filters.status || undefined,
      plan: filters.plan || undefined,
      search: filters.search || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    };
    fetchPayments(apiFilters);
  }, [filters, fetchPayments]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1F9BB7]"></div>
      </div>
    );
  }

  // Handle download
  const handleDownload = (format: "csv" | "excel") => {
    if (data?.transactions) {
      exportPaymentsReport(data.transactions, format);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.totalRevenueFormatted}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Transactions
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.totalTransactions}
            </p>
          </div>
          {data.summary.byStatus.slice(0, 2).map((item) => (
            <div
              key={item.status}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {item.status} Subscriptions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.count}
              </p>
              <p className="text-sm text-gray-500">{item.revenueFormatted}</p>
            </div>
          ))}
        </div>
      )}

      {/* Download Button */}
      <div className="flex justify-end">
        <DownloadDropdown
          onDownload={handleDownload}
          disabled={!data?.transactions || data.transactions.length === 0}
          label="Export Payments"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, event..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="past_due">Past Due</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <select
            value={filters.plan}
            onChange={(e) => handleFilterChange("plan", e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Plans</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Event Planner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.transactions.map((transaction: Transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden mr-3">
                        {transaction.eventPlanner?.photo ? (
                          <Image
                            src={transaction.eventPlanner.photo}
                            alt={transaction.eventPlanner.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCog className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.eventPlanner?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.eventPlanner?.email || ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {transaction.event?.name || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-900 dark:text-white">
                      {transaction.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.amountFormatted}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={transaction.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <ReportPagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          loading={loading}
        />
      )}
    </div>
  );
}

// Events Tab Content
function EventsTabContent() {
  const { data, loading, fetchEvents } = useReportsEvents();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "" as
      | ""
      | "draft"
      | "pending"
      | "approved"
      | "suspended"
      | "rejected",
    category: "" as "" | "concert" | "workshop" | "conference" | "other",
    search: "",
  });

  useEffect(() => {
    // Convert empty strings to undefined for the API call
    const apiFilters = {
      page: filters.page,
      limit: filters.limit,
      status: filters.status || undefined,
      category: filters.category || undefined,
      search: filters.search || undefined,
    };
    fetchEvents(apiFilters);
  }, [filters, fetchEvents]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle download
  const handleDownload = (format: "csv" | "excel") => {
    if (data?.events) {
      exportEventsReport(data.events, format);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1F9BB7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary & Download */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(data.summary.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-center"
            >
              <StatusBadge status={status} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {count as number}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Download Button */}
      <div className="flex justify-end">
        <DownloadDropdown
          onDownload={handleDownload}
          disabled={!data?.events || data.events.length === 0}
          label="Export Events"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="concert">Concert</option>
            <option value="workshop">Workshop</option>
            <option value="conference">Conference</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.events.map((event: EventReportItem) => (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {event.category} • ${event.ticketPrice}
                  </p>
                </div>
                <StatusBadge status={event.status} />
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {event.description}
              </p>

              {/* Creator Info */}
              {event.creator && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    {event.creator.photo ? (
                      <Image
                        src={event.creator.photo}
                        alt={event.creator.name}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCog className="w-3 h-3 text-gray-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {event.creator.name}
                  </span>
                </div>
              )}

              {/* Metrics */}
              {event.metrics && (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <Eye className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {event.metrics.views}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {event.metrics.likes}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <MessageCircle className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {event.metrics.comments}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {event.metrics.rsvps.total}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                Created: {new Date(event.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <CalendarCheck2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No events found</p>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && (
        <ReportPagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          loading={loading}
        />
      )}
    </div>
  );
}

// Users Tab Content
function UsersTabContent() {
  const { data, loading, fetchUsers } = useReportsUsers();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: "",
  });

  useEffect(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);

  // Handle download
  const handleDownload = (format: "csv" | "excel") => {
    if (data?.users) {
      exportUsersReport(data.users, format);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1F9BB7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Statistics
            </h3>
            <div className="text-center">
              <Users2 className="w-12 h-12 mx-auto mb-2 text-[#1F9BB7]" />
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {data.summary.totalUsers}
              </p>
              <p className="text-gray-500">Total Users</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.summary.activityBreakdown?.liked_event || 0}
                </p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.summary.activityBreakdown?.commented_event || 0}
                </p>
                <p className="text-xs text-gray-500">Comments</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.summary.activityBreakdown?.rsvp_event || 0}
                </p>
                <p className="text-xs text-gray-500">RSVPs</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.summary.activityBreakdown?.became_friends || 0}
                </p>
                <p className="text-xs text-gray-500">Friends</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Button */}
      <div className="flex justify-end">
        <DownloadDropdown
          onDownload={handleDownload}
          disabled={!data?.users || data.users.length === 0}
          label="Export Users"
        />
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.users.map((user: UserReportItem) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1F9BB7] to-blue-600 flex items-center justify-center overflow-hidden">
                {user.photo ? (
                  <Image
                    src={user.photo}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {user.phone && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Phone className="w-3 h-3 mr-2" />
                  {user.phone}
                </div>
              )}
              {user.address && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="w-3 h-3 mr-2" />
                  <span className="truncate">{user.address}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 text-center">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {data?.users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No users found</p>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && (
        <ReportPagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          loading={loading}
        />
      )}
    </div>
  );
}

// Event Planners Tab Content
function EventPlannersTabContent() {
  const { data, loading, fetchEventPlanners } = useReportsEventPlanners();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  useEffect(() => {
    fetchEventPlanners(filters);
  }, [filters, fetchEventPlanners]);

  // Handle download
  const handleDownload = (format: "csv" | "excel") => {
    if (data?.eventPlanners) {
      exportEventPlannersReport(data.eventPlanners, format);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1F9BB7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <UserCog className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.totalEventPlanners}
            </p>
            <p className="text-sm text-gray-500">Event Planners</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <CalendarCheck2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.totalEvents}
            </p>
            <p className="text-sm text-gray-500">Total Events</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.totalRevenueFormatted}
            </p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.activeSubscriptions}
            </p>
            <p className="text-sm text-gray-500">Active Subscriptions</p>
          </div>
        </div>
      )}

      {/* Download Button */}
      <div className="flex justify-end">
        <DownloadDropdown
          onDownload={handleDownload}
          disabled={!data?.eventPlanners || data.eventPlanners.length === 0}
          label="Export Event Planners"
        />
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search event planners..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
            className="pl-10"
          />
        </div>
      </div>

      {/* Event Planners Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Planner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subscriptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.eventPlanners.map((planner: EventPlannerReportItem) => (
                <tr
                  key={planner.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden mr-3">
                        {planner.photo ? (
                          <Image
                            src={planner.photo}
                            alt={`${planner.firstName} ${planner.lastName}`}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {planner.firstName?.charAt(0)}
                            {planner.lastName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {planner.firstName} {planner.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{planner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      {planner.companyName || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {planner.events.total}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({planner.events.approved} approved)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-600">
                      {planner.revenue.totalFormatted}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {planner.revenue.activeSubscriptions} /{" "}
                      {planner.revenue.totalSubscriptions}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(planner.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.eventPlanners.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <UserCog className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No event planners found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <ReportPagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          loading={loading}
        />
      )}
    </div>
  );
}

// Main Reports Page Component
export default function DashboardReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [period, setPeriod] = useState<Period>("month");

  const dashboard = useReportsDashboard();
  const charts = useReportsCharts();

  // Use ref to track fetch state and prevent infinite loops
  const hasFetchedRef = useRef(false);
  const lastPeriodRef = useRef<Period>(period);
  const lastTabRef = useRef<ReportTab>(activeTab);

  // Fetch overview data - memoized without hook objects in dependencies
  const fetchOverviewData = useCallback(async () => {
    await Promise.all([
      dashboard.fetchDashboard(period),
      charts.fetchAllCharts(period),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Fetch only when tab or period changes, not on every render
  useEffect(() => {
    if (activeTab === "overview") {
      const shouldFetch =
        !hasFetchedRef.current ||
        lastPeriodRef.current !== period ||
        lastTabRef.current !== activeTab;

      if (shouldFetch) {
        hasFetchedRef.current = true;
        lastPeriodRef.current = period;
        lastTabRef.current = activeTab;
        fetchOverviewData();
      }
    }
  }, [activeTab, period, fetchOverviewData]);

  const isLoading = dashboard.loading || charts.loading;

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-300">
            Comprehensive reports for payments, events, users, and event
            planners
          </p>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                  period === option.value
                    ? "bg-[#1F9BB7] text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Button
            onClick={fetchOverviewData}
            variant="outline"
            disabled={isLoading}
            className="hover:bg-[#1F9BB7]/10"
          >
            <RefreshCw
              className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabOptions.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                    isActive
                      ? "bg-[#1F9BB7] text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === "overview" && (
            <OverviewTabContent
              dashboard={dashboard}
              charts={charts}
              loading={isLoading}
            />
          )}
          {activeTab === "payments" && <PaymentsTabContent />}
          {activeTab === "events" && <EventsTabContent />}
          {activeTab === "users" && <UsersTabContent />}
          {activeTab === "event-planners" && <EventPlannersTabContent />}
        </div>
      </div>
    </div>
  );
}
