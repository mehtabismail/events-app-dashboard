"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePendingUsers, PendingUser } from "@/components/usePendingUsers";
import {
  useUpdateUserStatus,
  UserStatus,
} from "@/components/useUpdateUserStatus";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Search,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PendingApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(
    null
  );

  // Hooks - don't pass initial params to prevent auto-fetch
  const { users, loading, error, pagination, refetch, setUsers } =
    usePendingUsers();
  const { updateUserStatus, loading: updateLoading } = useUpdateUserStatus();

  // Use ref to prevent infinite loops
  const hasFetchedRef = useRef(false);
  const lastPageRef = useRef(1);

  // Initial fetch and fetch when page changes
  useEffect(() => {
    // Only fetch if not fetched yet or page actually changed
    if (!hasFetchedRef.current || lastPageRef.current !== currentPage) {
      hasFetchedRef.current = true;
      lastPageRef.current = currentPage;
      refetch({ page: currentPage, limit: 12 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    // Reset fetch flags for manual refresh
    hasFetchedRef.current = false;
    lastPageRef.current = 1;
    // Note: API might not support search for pending users, but we can filter client-side
    refetch({ page: 1, limit: 12 });
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return CheckCircle2;
      case "pending":
        return Clock;
      case "suspended":
        return XCircle;
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
    user: PendingUser,
    newStatus: UserStatus
  ) => {
    setStatusChangeLoading(user._id);
    const updatedUser = await updateUserStatus(user._id, newStatus);

    if (updatedUser) {
      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );

      // If status changed from pending, remove from list or refresh
      if (newStatus !== "pending") {
        // Remove from list if no longer pending
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== user._id));
        // Refresh to get updated count - reset fetch flag
        hasFetchedRef.current = false;
        lastPageRef.current = currentPage;
        refetch({ page: currentPage, limit: 12 });
      }
    }

    setStatusChangeLoading(null);
  };

  // Filter users by search term (client-side filtering)
  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.company_name &&
            user.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users;

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1F9BB7] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading pending approvals...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Pending Approvals
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button
            onClick={() => {
              hasFetchedRef.current = false;
              refetch({ page: currentPage, limit: 12 });
            }}
            className="bg-[#1F9BB7] hover:bg-[#1a8a9f]"
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
            Pending Approvals
          </h1>
          <p className="text-gray-500 dark:text-gray-300">
            Review and approve pending event planner registrations
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => {
                hasFetchedRef.current = false;
                refetch({ page: currentPage, limit: 12 });
              }}
              variant="outline"
              className="hover:bg-[#1F9BB7]/10"
              disabled={loading}
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
              />
              Refresh
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {pagination?.totalUsers || 0} pending approval
              {(pagination?.totalUsers || 0) !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F9BB7]"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-[#1F9BB7] hover:bg-[#1a8a9f] text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user, index) => {
              const StatusIcon = getStatusIcon(user.status);
              const isChangingStatus = statusChangeLoading === user._id;

              return (
                <div
                  key={user._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in overflow-hidden isolate"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* User Header with Gradient */}
                  <div className="relative bg-gradient-to-br from-[#1F9BB7] via-blue-500 to-purple-500 p-6 pb-12">
                    <div className="absolute top-3 right-3">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
                          getStatusBadgeColor(user.status)
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {getStatusDisplayName(user.status)}
                      </span>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="relative -mt-10 flex justify-center z-10">
                    <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {user.photo ? (
                        <Image
                          src={user.photo}
                          alt={`${user.first_name} ${user.last_name}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F9BB7] to-purple-500">
                          <span className="text-2xl font-bold text-white">
                            {user.first_name?.charAt(0) || ""}
                            {user.last_name?.charAt(0) || ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="p-6 pt-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">
                      {user.email}
                    </p>

                    {/* Quick Info */}
                    <div className="space-y-2 mb-4">
                      {user.company_name && (
                        <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                          <Building2 className="w-3 h-3 mr-1" />
                          <span className="truncate">{user.company_name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Joined {formatDate(user.createdAt)}</span>
                      </div>
                    </div>

                    {/* Status Change Dropdown */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
                        Change Status:
                      </label>
                      <select
                        value={user.status}
                        onChange={(e) =>
                          handleStatusChange(user, e.target.value as UserStatus)
                        }
                        disabled={isChangingStatus || updateLoading}
                        className={cn(
                          "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F9BB7]",
                          isChangingStatus && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      {isChangingStatus && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Updating...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pending Approvals
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm
                ? "No pending approvals match your search criteria."
                : "There are no pending event planner approvals at the moment."}
            </p>
            {searchTerm ? (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  handleSearch();
                }}
                className="bg-[#1F9BB7] hover:bg-[#1a8a9f]"
              >
                Clear Search
              </Button>
            ) : (
              <Button
                onClick={() => {
                  hasFetchedRef.current = false;
                  refetch({ page: currentPage, limit: 12 });
                }}
                className="bg-[#1F9BB7] hover:bg-[#1a8a9f]"
              >
                Refresh
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalUsers} total pending approvals)
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
                            ? "bg-[#1F9BB7] text-white"
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
