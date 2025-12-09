"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEvents, GetEventsParams } from "@/components/useEvents";
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
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function DashboardEvents() {
  const router = useRouter();

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  // Hooks
  const { events, loading, error, pagination, refetch, setEvents } = useEvents({
    page: 1,
    limit: 12,
    status: "pending",
  });
  const { updateEventStatus, loading: statusLoading } = useEventStatus();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<unknown>(null);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>("pending");

  // Debug logging
  console.log("DashboardEvents rendered");
  console.log("Events:", events);
  console.log("Loading:", loading);
  console.log("Error:", error);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openEditModal = (event: unknown) => {
    setSelectedEvent(event);
    setSelectedStatus((event as { status: string }).status as EventStatus);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
    setSelectedStatus("pending");
  };

  const handleStatusUpdate = async () => {
    if (!selectedEvent) return;

    const success = await updateEventStatus(
      (selectedEvent as { _id: string })._id,
      selectedStatus
    );
    if (success) {
      // Refresh the events data to show updated status
      await handleFetchEvents();
      closeEditModal();
    }
  };

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

  // Handle fetch events with filters
  const handleFetchEvents = (params?: Partial<GetEventsParams>) => {
    const fetchParams: GetEventsParams = {
      page: params?.page ?? currentPage,
      limit: 12,
      status:
        params?.status ?? (filterStatus === "all" ? undefined : filterStatus),
    };
    refetch(fetchParams);
  };

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    handleFetchEvents({
      status: status === "all" ? undefined : status,
      page: 1,
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleFetchEvents({ page: newPage });
  };

  // Count events by status (from pagination if available)
  const getStatusCount = (status: string) => {
    if (status === "all") {
      return pagination?.totalEvents || events.length;
    }
    // For filtered status, we'd need backend to provide counts per status
    // For now, return current filtered events count
    return events.filter((event) => event.status === status).length;
  };

  // Status filter options
  const statusFilters = [
    {
      value: "all",
      label: "All",
      color:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      value: "pending",
      label: "Pending",
      color:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
    },
    {
      value: "approved",
      label: "Approved",
      color:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200",
    },
    {
      value: "rejected",
      label: "Rejected",
      color:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200",
    },
    {
      value: "suspended",
      label: "Suspended",
      color:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200",
    },
  ];

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Events
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => handleFetchEvents()}
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Events Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-300">
            Manage and view all events in your system
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => handleFetchEvents()}
              variant="outline"
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Events
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {filterStatus === "all"
                ? `Showing all ${
                    pagination?.totalEvents || events.length
                  } event${
                    (pagination?.totalEvents || events.length) !== 1 ? "s" : ""
                  }`
                : `Showing ${events.length} ${
                    filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
                  } event${events.length !== 1 ? "s" : ""} (of ${
                    pagination?.totalEvents || events.length
                  } total)`}
            </span>
          </div>
        </div>

        {/* Status Filter Navbar */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map((filter) => {
                const isActive = filterStatus === filter.value;
                const count = getStatusCount(filter.value);
                return (
                  <button
                    key={filter.value}
                    onClick={() => handleStatusFilter(filter.value)}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                      border-2 flex items-center gap-2
                      ${
                        isActive
                          ? `${filter.color} border-current shadow-md scale-105`
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
                      }
                    `}
                  >
                    <span className="capitalize">{filter.label}</span>
                    <span
                      className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${
                          isActive
                            ? "bg-white/30 dark:bg-black/30"
                            : "bg-gray-200 dark:bg-gray-600"
                        }
                      `}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Event Image */}
              <div className="relative h-48 rounded-t-xl overflow-hidden">
                {event.images && event.images.length > 0 ? (
                  <Image
                    src={event.images[0].url}
                    alt={event.name}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white opacity-50" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {event.category.charAt(0).toUpperCase() +
                      event.category.slice(1)}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {event.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{formatDate(event.dateTime)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    <span className="truncate">{event.location.address}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    <span>${event.ticket_price}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-purple-500" />
                    <span className="truncate">{event.userId.email}</span>
                  </div>
                </div>

                {/* Media Indicators */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  {event.images && event.images.length > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      <span>
                        {event.images.length} image
                        {event.images.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {event.videos && event.videos.length > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Video className="w-3 h-3 mr-1" />
                      <span>
                        {event.videos.length} video
                        {event.videos.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      console.log("View Details clicked for event:", event._id);
                      router.push(`/dashboard/events/${event._id}`);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-gray-50 !text-black dark:text-white border border-gray-300 dark:border-gray-600"
                    onClick={() => openEditModal(event)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {events.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filterStatus === "all"
                ? "No Events Found"
                : `No ${
                    filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
                  } Events Found`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {pagination?.totalEvents === 0
                ? "There are no events to display at the moment."
                : filterStatus === "all"
                ? "There are no events in the system."
                : `There are no ${filterStatus} events. Try selecting a different status filter.`}
            </p>
            {pagination?.totalEvents === 0 ? (
              <Button
                onClick={() => handleFetchEvents()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Refresh
              </Button>
            ) : (
              <Button
                onClick={() => handleStatusFilter("all")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View All Events
              </Button>
            )}
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
                        className={`
                          w-8 h-8 rounded-lg text-sm font-medium transition-colors
                          ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }
                        `}
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

      {/* Edit Status Modal */}
      {isEditModalOpen && selectedEvent ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full animate-modal-in">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Update Event Status
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Event:{" "}
              <span className="font-semibold">
                {(selectedEvent as { name: string }).name}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Select the new status for this event:
            </p>

            <div className="space-y-3 mb-6">
              {(
                [
                  "pending",
                  "approved",
                  "rejected",
                  "suspended",
                ] as EventStatus[]
              ).map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as EventStatus)
                    }
                    className="mr-3"
                  />
                  <span className="text-gray-900 dark:text-white capitalize">
                    {status}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={closeEditModal}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={statusLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {statusLoading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modal-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
