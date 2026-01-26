"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck2,
  Users2,
  UserCog,
  BarChart2,
  CreditCard,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Calendar,
  Ticket,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useEvents } from "@/components/useEvents";
import { useUsers } from "@/components/useUsers";
import { useReportsDashboard, useReportsCharts } from "@/hooks/useReports";
import { Period, ChartData } from "@/types/reports";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Simple Bar Chart Component for Dashboard
function DashboardChart({
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
        <div className="h-40 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const dataset = data.datasets[0];
  const chartHeight = 160; // h-40 = 160px
  const maxValue = Math.max(...dataset.data, 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="relative h-40 flex items-end justify-between gap-1 px-2">
        {data.labels.slice(0, 12).map((label, index) => {
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
                  className="absolute bottom-0 w-full max-w-6 rounded-t-md transition-all duration-300 group-hover:opacity-80 group-hover:scale-105"
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
              <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full text-center mt-1">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mini Stat Card for engagement
function MiniStatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
      <div
        className={cn(
          "w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center",
          color
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

// Period options for analytics
const periodOptions: { value: Period; label: string }[] = [
  { value: "week", label: "7 Days" },
  { value: "month", label: "30 Days" },
  { value: "year", label: "12 Months" },
];

export default function DashboardOverview() {
  const router = useRouter();
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [activeEvents, setActiveEvents] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalEventPlanners, setTotalEventPlanners] = useState<number>(0);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<Period>("month");

  // Reports hooks
  const reportsDashboard = useReportsDashboard();
  const reportsCharts = useReportsCharts();

  // Use ref to track if initial fetch is done and prevent infinite loops
  const hasFetchedRef = useRef(false);
  const lastPeriodRef = useRef<Period>(analyticsPeriod);

  // Fetch analytics data - memoized with only the functions we need
  const fetchAnalyticsData = useCallback(async () => {
    await Promise.all([
      reportsDashboard.fetchDashboard(analyticsPeriod),
      reportsCharts.fetchAllCharts(analyticsPeriod),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsPeriod]);

  // Initial fetch and period change fetch
  useEffect(() => {
    // Only fetch if not fetched yet or period changed
    if (!hasFetchedRef.current || lastPeriodRef.current !== analyticsPeriod) {
      hasFetchedRef.current = true;
      lastPeriodRef.current = analyticsPeriod;
      fetchAnalyticsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsPeriod]);

  // Fetch total events count (without status filter to get all events)
  // Use a higher limit to ensure we get pagination data
  const { pagination: eventsPagination, events: allEvents } = useEvents({
    page: 1,
    limit: 100, // Higher limit to get better pagination data
    // Don't pass status to get all events
  });

  // Fetch active events count (approved status)
  const { pagination: activeEventsPagination, events: activeEventsList } =
    useEvents({
      page: 1,
      limit: 1,
      status: "approved",
    });

  // Fetch total users count
  const { pagination: usersPagination } = useUsers({
    page: 1,
    limit: 1,
    role: "user",
  });

  // Fetch total event planners count
  const { pagination: plannersPagination } = useUsers({
    page: 1,
    limit: 1,
    role: "event-planner",
  });

  // Update counts when pagination data is available
  useEffect(() => {
    console.log("Total Events - pagination:", eventsPagination);
    console.log("Total Events - allEvents:", allEvents);

    if (eventsPagination) {
      console.log(
        "Setting totalEvents from pagination:",
        eventsPagination.totalEvents
      );
      setTotalEvents(eventsPagination.totalEvents);
    } else if (allEvents) {
      // Fallback to events array length if pagination not available
      console.log("Setting totalEvents from events length:", allEvents.length);
      setTotalEvents(allEvents.length);
    }
  }, [eventsPagination, allEvents]);

  useEffect(() => {
    if (activeEventsPagination) {
      setActiveEvents(activeEventsPagination.totalEvents);
    } else if (activeEventsList && activeEventsList.length > 0) {
      // Fallback to events array length if pagination not available
      setActiveEvents(activeEventsList.length);
    }
  }, [activeEventsPagination, activeEventsList]);

  useEffect(() => {
    if (usersPagination) {
      setTotalUsers(usersPagination.totalUsers);
    }
  }, [usersPagination]);

  useEffect(() => {
    if (plannersPagination) {
      setTotalEventPlanners(plannersPagination.totalUsers);
    }
  }, [plannersPagination]);

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-8">
          Welcome to your events management dashboard
        </p>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalEvents}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <CalendarCheck2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Events
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {activeEvents}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CalendarCheck2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalUsers}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Users2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Event Planners
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalEventPlanners}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <UserCog className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Payments
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/dashboard/events")}
              className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <CalendarCheck2 className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Manage Events
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View and manage all events
              </p>
            </button>

            <button
              onClick={() => router.push("/dashboard/users")}
              className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Users2 className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Manage Users
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View and manage users
              </p>
            </button>

            <button
              onClick={() => router.push("/dashboard/event-planners")}
              className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <UserCog className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Manage Event Planners
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View and manage event planners
              </p>
            </button>

            <button
              onClick={() => router.push("/dashboard/reports")}
              className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <BarChart2 className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                View Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Access analytics and reports
              </p>
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-8">
          {/* Analytics Header with Period Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analytics Overview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Platform performance and engagement metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAnalyticsPeriod(option.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      analyticsPeriod === option.value
                        ? "bg-[#1F9BB7] text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button
                onClick={fetchAnalyticsData}
                variant="outline"
                size="sm"
                disabled={reportsDashboard.loading || reportsCharts.loading}
                className="hover:bg-[#1F9BB7]/10"
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    (reportsDashboard.loading || reportsCharts.loading) &&
                    "animate-spin"
                  )}
                />
              </Button>
            </div>
          </div>

          {/* Revenue & Subscriptions */}
          {reportsDashboard.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-100">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {reportsDashboard.data.revenue.totalFormatted}
                    </p>
                    {reportsDashboard.data.revenue.growth !== undefined && (
                      <div className="flex items-center mt-2 text-sm">
                        {reportsDashboard.data.revenue.growth >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span>
                          {Math.abs(
                            reportsDashboard.data.revenue.growth
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                  <DollarSign className="w-12 h-12 text-green-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">
                      Active Subscriptions
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {reportsDashboard.data.revenue.activeSubscriptions}
                    </p>
                    <p className="text-sm text-blue-200 mt-2">
                      of {reportsDashboard.data.revenue.totalSubscriptions}{" "}
                      total
                    </p>
                  </div>
                  <Activity className="w-12 h-12 text-blue-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-100">
                      New Users
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {reportsDashboard.data.users.inPeriod}
                    </p>
                    {reportsDashboard.data.users.growth !== undefined && (
                      <div className="flex items-center mt-2 text-sm">
                        {reportsDashboard.data.users.growth >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span>
                          {Math.abs(reportsDashboard.data.users.growth).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                  <Users2 className="w-12 h-12 text-purple-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-100">
                      New Events
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {reportsDashboard.data.events.inPeriod}
                    </p>
                    {reportsDashboard.data.events.growth !== undefined && (
                      <div className="flex items-center mt-2 text-sm">
                        {reportsDashboard.data.events.growth >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span>
                          {Math.abs(
                            reportsDashboard.data.events.growth
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                  <CalendarCheck2 className="w-12 h-12 text-orange-200 opacity-80" />
                </div>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DashboardChart
              data={reportsCharts.revenueChart}
              title="Revenue Trend"
              color="#10B981"
            />
            <DashboardChart
              data={reportsCharts.registrationsChart}
              title="User Registrations"
              color="#1F9BB7"
            />
          </div>

          {/* Engagement Stats */}
          {reportsDashboard.data && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Platform Engagement
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <MiniStatCard
                  label="Views"
                  value={reportsDashboard.data.engagement.totalViews}
                  icon={Eye}
                  color="bg-blue-100 dark:bg-blue-900/50 text-blue-600"
                />
                <MiniStatCard
                  label="Unique Views"
                  value={reportsDashboard.data.engagement.totalUniqueViews}
                  icon={Eye}
                  color="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600"
                />
                <MiniStatCard
                  label="Likes"
                  value={reportsDashboard.data.engagement.totalLikes}
                  icon={Heart}
                  color="bg-red-100 dark:bg-red-900/50 text-red-600"
                />
                <MiniStatCard
                  label="Shares"
                  value={reportsDashboard.data.engagement.totalShares}
                  icon={Share2}
                  color="bg-green-100 dark:bg-green-900/50 text-green-600"
                />
                <MiniStatCard
                  label="Comments"
                  value={reportsDashboard.data.engagement.totalComments}
                  icon={MessageCircle}
                  color="bg-purple-100 dark:bg-purple-900/50 text-purple-600"
                />
                <MiniStatCard
                  label="RSVPs"
                  value={reportsDashboard.data.engagement.totalRsvps}
                  icon={Calendar}
                  color="bg-orange-100 dark:bg-orange-900/50 text-orange-600"
                />
                <MiniStatCard
                  label="Ticket Clicks"
                  value={reportsDashboard.data.engagement.totalTicketRedirects}
                  icon={Ticket}
                  color="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600"
                />
              </div>
            </div>
          )}

          {/* Events by Status */}
          {reportsDashboard.data && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Events by Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(reportsDashboard.data.events.byStatus).map(
                  ([status, count]) => {
                    const statusColors: Record<string, string> = {
                      draft: "bg-gray-100 text-gray-800 border-gray-300",
                      pending:
                        "bg-yellow-100 text-yellow-800 border-yellow-300",
                      approved: "bg-green-100 text-green-800 border-green-300",
                      suspended:
                        "bg-orange-100 text-orange-800 border-orange-300",
                      rejected: "bg-red-100 text-red-800 border-red-300",
                    };

                    return (
                      <div
                        key={status}
                        className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                      >
                        <span
                          className={cn(
                            "inline-block px-3 py-1 rounded-full text-xs font-medium border capitalize mb-2",
                            statusColors[status] || "bg-gray-100 text-gray-800"
                          )}
                        >
                          {status}
                        </span>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {count}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Revenue by Plan */}
          {reportsDashboard.data &&
            reportsDashboard.data.revenue.byPlan.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Revenue by Subscription Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportsDashboard.data.revenue.byPlan.map((plan) => (
                    <div
                      key={plan.plan}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            plan.plan === "weekly"
                              ? "bg-blue-100 dark:bg-blue-900/50"
                              : "bg-purple-100 dark:bg-purple-900/50"
                          )}
                        >
                          <CreditCard
                            className={cn(
                              "w-6 h-6",
                              plan.plan === "weekly"
                                ? "text-blue-600"
                                : "text-purple-600"
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white capitalize">
                            {plan.plan} Plan
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {plan.count} subscriptions
                          </p>
                        </div>
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
            )}

          {/* Loading State */}
          {(reportsDashboard.loading || reportsCharts.loading) &&
            !reportsDashboard.data && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F9BB7]"></div>
              </div>
            )}

          {/* View Full Reports Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => router.push("/dashboard/reports")}
              className="bg-[#1F9BB7] hover:bg-[#1a8a9f] text-white px-8 py-3"
            >
              <BarChart2 className="w-5 h-5 mr-2" />
              View Full Reports & Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
