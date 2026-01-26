"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEvents, GetEventsParams, Event } from "@/components/useEvents";
import { useEventStatus, EventStatus } from "@/components/useEventStatus";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  DollarSign,
  User,
  Image as ImageIcon,
  Video,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardEvents() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(
    null
  );

  // Hooks
  const { events, loading, error, pagination, refetch, setEvents } = useEvents({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { updateEventStatus, loading: statusUpdateLoading } = useEventStatus();

  // Use ref to prevent infinite loops
  const hasFetchedRef = useRef(false);
  const lastPageRef = useRef(1);

  // Initial fetch and fetch when page changes
  useEffect(() => {
    if (!hasFetchedRef.current || lastPageRef.current !== currentPage) {
      hasFetchedRef.current = true;
      lastPageRef.current = currentPage;
      refetch({
        page: currentPage,
        limit: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    hasFetchedRef.current = false;
    lastPageRef.current = 1;
    refetch({
      page: 1,
      limit: 20,
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle refresh
  const handleRefresh = () => {
    hasFetchedRef.current = false;
    refetch({
      page: currentPage,
      limit: 20,
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    hasFetchedRef.current = false;
    lastPageRef.current = 1;
    refetch({
      page: 1,
      limit: 20,
      status: status === "all" ? undefined : status,
      search: searchTerm || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return CheckCircle2;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      case "suspended":
        return AlertCircle;
      case "draft":
        return FileText;
      default:
        return AlertCircle;
    }
  };

  // Get status display name
  const getStatusDisplayName = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle status change
  const handleStatusChange = async (
    event: Event,
    newStatus: EventStatus
  ) => {
    setStatusChangeLoading(event._id);

    const success = await updateEventStatus(event._id, newStatus);

    if (success) {
      // Update the event in the local state
      setEvents((prevEvents: Event[]) =>
        prevEvents.map((e) =>
          e._id === event._id ? { ...e, status: newStatus } : e
        )
      );
    }

    setStatusChangeLoading(null);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "concert":
        return "bg-purple-100 text-purple-800";
      case "conference":
        return "bg-blue-100 text-blue-800";
      case "workshop":
        return "bg-green-100 text-green-800";
      case "sports":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter events by status (client-side if needed)
  const filteredEvents =
    statusFilter === "all"
      ? events
      : events.filter((event) => event.status === statusFilter);

  // Status filter options
  const statusFilters = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-800" },
    {
      value: "draft",
      label: "Draft",
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "approved",
      label: "Approved",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "suspended",
      label: "Suspended",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "rejected",
      label: "Rejected",
      color: "bg-red-100 text-red-800",
    },
  ];

  // Loading state
  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Events
              </h1>
              <p className="text-gray-500 dark:text-gray-300">
                Manage all events, their status, and details
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="hover:bg-blue-600/10"
              disabled={loading}
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
              />
              Refresh
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {pagination?.totalEvents || 0} event
              {(pagination?.totalEvents || 0) !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                Filter by Status:
              </span>
              {statusFilters.map((filter) => {
                const isActive = statusFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => handleStatusFilter(filter.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border-2",
                      isActive
                        ? `${filter.color} border-current shadow-md`
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events Table */}
        {filteredEvents.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Date & Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEvents.map((event: Event) => {
                    const StatusIcon = getStatusIcon(event.status);
                    return (
                      <tr
                        key={event._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Event Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                              {event.images && event.images.length > 0 ? (
                                <Image
                                  src={event.images[0].url}
                                  alt={event.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-500">
                                  <ImageIcon className="w-6 h-6 text-white opacity-50" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white truncate">
                                {event.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                              event.category
                            )}`}
                          >
                            {event.category.charAt(0).toUpperCase() +
                              event.category.slice(1)}
                          </span>
                        </td>

                        {/* Date & Location */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(event.dateTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">
                                {event.location.address}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span>{event.ticket_price}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border w-fit",
                                getStatusBadgeColor(event.status)
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {getStatusDisplayName(event.status)}
                            </span>
                            {/* Status Change Dropdown */}
                            <select
                              value={event.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  event,
                                  e.target.value as EventStatus
                                )
                              }
                              disabled={
                                statusChangeLoading === event._id ||
                                statusUpdateLoading
                              }
                              className={cn(
                                "text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600",
                                statusChangeLoading === event._id &&
                                  "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <option value="draft">Set Draft</option>
                              <option value="pending">Set Pending</option>
                              <option value="approved">Set Approved</option>
                              <option value="suspended">Set Suspended</option>
                              <option value="rejected">Set Rejected</option>
                            </select>
                            {statusChangeLoading === event._id && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Updating...
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.createdAt)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-blue-600/10"
                              onClick={() => router.push(`/dashboard/events/${event._id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => router.push(`/dashboard/events/${event._id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No events match your search/filter criteria."
                : "There are no events registered yet."}
            </p>
            <div className="flex justify-center gap-3">
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    handleRefresh();
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalEvents} total events)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
