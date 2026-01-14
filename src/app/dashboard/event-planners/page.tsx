"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useUsers, User, GetUsersParams } from "@/components/useUsers";
import { useUpdateUser, UpdateUserParams } from "@/components/useUpdateUser";
import {
  useUpdateUserStatus,
  UserStatus,
} from "@/components/useUpdateUserStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserCog,
  Search,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Extended User type with status
interface EventPlanner extends User {
  status?: "pending" | "active" | "suspended";
}

export default function EventPlannersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(
    null
  );

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EventPlanner | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState<UpdateUserParams>({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
    phone: "",
    address: "",
  });

  // Create form state
  const [createFormData, setCreateFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    company_name: "",
    phone: "",
    address: "",
  });

  // Hooks
  const { users, loading, error, pagination, refetch, setUsers } = useUsers({
    page: 1,
    limit: 20,
    role: "event-planner",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { updateUser, loading: updateLoading } = useUpdateUser();
  const { updateUserStatus, loading: statusUpdateLoading } =
    useUpdateUserStatus();

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
        role: "event-planner",
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
      role: "event-planner",
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
      role: "event-planner",
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
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status?: string) => {
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
  const getStatusIcon = (status?: string) => {
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
  const getStatusDisplayName = (status?: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle status change
  const handleStatusChange = async (
    user: EventPlanner,
    newStatus: UserStatus
  ) => {
    setStatusChangeLoading(user._id);
    const updatedUser = await updateUserStatus(user._id, newStatus);

    if (updatedUser) {
      // Update the user in the local state
      setUsers((prevUsers: User[]) =>
        prevUsers.map((u) =>
          u._id === updatedUser._id ? { ...u, status: newStatus } : u
        )
      );
    }

    setStatusChangeLoading(null);
  };

  // Open view modal
  const openViewModal = (user: EventPlanner) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (user: EventPlanner) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      company_name: user.company_name || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setIsEditModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setCreateFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      company_name: "",
      phone: "",
      address: "",
    });
    setIsCreateModalOpen(true);
  };

  // Close modals
  const closeModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedUser(null);
    setEditFormData({
      first_name: "",
      last_name: "",
      email: "",
      company_name: "",
      phone: "",
      address: "",
    });
  };

  // Handle edit form change
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle create form change
  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Only send non-empty fields
    const updates: UpdateUserParams = {};
    if (editFormData.first_name) updates.first_name = editFormData.first_name;
    if (editFormData.last_name) updates.last_name = editFormData.last_name;
    if (editFormData.email) updates.email = editFormData.email;
    if (editFormData.company_name)
      updates.company_name = editFormData.company_name;
    if (editFormData.phone) updates.phone = editFormData.phone;
    if (editFormData.address) updates.address = editFormData.address;

    const updatedUser = await updateUser(selectedUser._id, updates);
    if (updatedUser) {
      // Update local state
      setUsers((prevUsers: User[]) =>
        prevUsers.map((u) => (u._id === selectedUser._id ? updatedUser : u))
      );
      closeModals();
    }
  };

  // Handle create user (placeholder - needs backend API)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement create event planner API call
    // For now, just show a message that this feature needs backend support
    alert(
      "Create Event Planner functionality requires backend API implementation."
    );
    closeModals();
  };

  // Filter users by status (client-side)
  const filteredUsers =
    statusFilter === "all"
      ? users
      : users.filter(
          (user: EventPlanner) => (user as EventPlanner).status === statusFilter
        );

  // Status filter options
  const statusFilters = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-800" },
    {
      value: "active",
      label: "Active",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "suspended",
      label: "Suspended",
      color: "bg-red-100 text-red-800",
    },
  ];

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1F9BB7] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading event planners...
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
            Error Loading Event Planners
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button
            onClick={handleRefresh}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Event Planners
              </h1>
              <p className="text-gray-500 dark:text-gray-300">
                Manage all event planners, their status, and profiles
              </p>
            </div>
            <Button
              onClick={openCreateModal}
              className="bg-[#1F9BB7] hover:bg-[#1a8a9f] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event Planner
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button
              onClick={handleRefresh}
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
              {pagination?.totalUsers || 0} event planner
              {(pagination?.totalUsers || 0) !== 1 ? "s" : ""} found
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
                    onClick={() => setStatusFilter(filter.value)}
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

        {/* Event Planners Table */}
        {filteredUsers.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Event Planner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user: EventPlanner, index: number) => {
                    const StatusIcon = getStatusIcon(
                      (user as EventPlanner).status
                    );
                    const isChangingStatus = statusChangeLoading === user._id;

                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Event Planner Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                              {user.photo ? (
                                <Image
                                  src={user.photo}
                                  alt={`${user.first_name} ${user.last_name}`}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F9BB7] to-purple-500">
                                  <span className="text-lg font-bold text-white">
                                    {user.first_name?.charAt(0) || ""}
                                    {user.last_name?.charAt(0) || ""}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">
                              {user.company_name || "-"}
                            </span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                            {user.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">
                                  {user.address}
                                </span>
                              </div>
                            )}
                            {!user.phone && !user.address && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border w-fit",
                                getStatusBadgeColor(
                                  (user as EventPlanner).status
                                )
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {getStatusDisplayName(
                                (user as EventPlanner).status
                              )}
                            </span>
                            {/* Status Change Dropdown */}
                            <select
                              value={(user as EventPlanner).status || "active"}
                              onChange={(e) =>
                                handleStatusChange(
                                  user,
                                  e.target.value as UserStatus
                                )
                              }
                              disabled={isChangingStatus || statusUpdateLoading}
                              className={cn(
                                "text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1F9BB7]",
                                isChangingStatus &&
                                  "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <option value="pending">Set Pending</option>
                              <option value="active">Set Active</option>
                              <option value="suspended">Set Suspended</option>
                            </select>
                            {isChangingStatus && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Updating...
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-[#1F9BB7]/10"
                              onClick={() => openViewModal(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#1F9BB7] hover:bg-[#1a8a9f] text-white"
                              onClick={() => openEditModal(user)}
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
              <UserCog className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Event Planners Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No event planners match your search/filter criteria."
                : "There are no event planners registered yet."}
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
                onClick={openCreateModal}
                className="bg-[#1F9BB7] hover:bg-[#1a8a9f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event Planner
              </Button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalUsers} total event planners)
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

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-modal-in">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-[#1F9BB7] via-blue-500 to-purple-500 p-6 pb-16 rounded-t-2xl">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white">
                Event Planner Details
              </h3>
            </div>

            {/* Avatar */}
            <div className="relative -mt-12 flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                {selectedUser.photo ? (
                  <Image
                    src={selectedUser.photo}
                    alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F9BB7] to-purple-500">
                    <span className="text-3xl font-bold text-white">
                      {selectedUser.first_name?.charAt(0) || ""}
                      {selectedUser.last_name?.charAt(0) || ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="p-6 pt-4">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h4>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border",
                      getStatusBadgeColor(
                        (selectedUser as EventPlanner).status
                      )
                    )}
                  >
                    {React.createElement(
                      getStatusIcon((selectedUser as EventPlanner).status),
                      { className: "w-4 h-4" }
                    )}
                    {getStatusDisplayName(
                      (selectedUser as EventPlanner).status
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                {selectedUser.phone && (
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedUser.phone}
                      </p>
                    </div>
                  </div>
                )}

                {selectedUser.company_name && (
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Building2 className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Company
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedUser.company_name}
                      </p>
                    </div>
                  </div>
                )}

                {selectedUser.address && (
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Address
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedUser.address}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Member Since
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={closeModals}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-[#1F9BB7] hover:bg-[#1a8a9f] text-white"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedUser);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-modal-in">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-[#1F9BB7] via-blue-500 to-purple-500 p-6 rounded-t-2xl">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white">
                Edit Event Planner
              </h3>
              <p className="text-white/80 text-sm mt-1">
                Update profile for {selectedUser.first_name}{" "}
                {selectedUser.last_name}
              </p>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleUpdateUser} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={editFormData.first_name}
                      onChange={handleEditFormChange}
                      placeholder="First name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={editFormData.last_name}
                      onChange={handleEditFormChange}
                      placeholder="Last name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    placeholder="Email address"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={editFormData.company_name}
                    onChange={handleEditFormChange}
                    placeholder="Company name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={editFormData.phone}
                    onChange={handleEditFormChange}
                    placeholder="Phone number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditFormChange}
                    placeholder="Address"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeModals}
                  disabled={updateLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#1F9BB7] hover:bg-[#1a8a9f] text-white"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-modal-in">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-[#1F9BB7] via-blue-500 to-purple-500 p-6 rounded-t-2xl">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white">
                Add New Event Planner
              </h3>
              <p className="text-white/80 text-sm mt-1">
                Create a new event planner account
              </p>
            </div>

            {/* Create Form */}
            <form onSubmit={handleCreateUser} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="create_first_name">First Name *</Label>
                    <Input
                      id="create_first_name"
                      name="first_name"
                      value={createFormData.first_name}
                      onChange={handleCreateFormChange}
                      placeholder="First name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="create_last_name">Last Name *</Label>
                    <Input
                      id="create_last_name"
                      name="last_name"
                      value={createFormData.last_name}
                      onChange={handleCreateFormChange}
                      placeholder="Last name"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="create_email">Email Address *</Label>
                  <Input
                    id="create_email"
                    name="email"
                    type="email"
                    value={createFormData.email}
                    onChange={handleCreateFormChange}
                    placeholder="Email address"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="create_password">Password *</Label>
                  <Input
                    id="create_password"
                    name="password"
                    type="password"
                    value={createFormData.password}
                    onChange={handleCreateFormChange}
                    placeholder="Password"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="create_company_name">Company Name</Label>
                  <Input
                    id="create_company_name"
                    name="company_name"
                    value={createFormData.company_name}
                    onChange={handleCreateFormChange}
                    placeholder="Company name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="create_phone">Phone Number</Label>
                  <Input
                    id="create_phone"
                    name="phone"
                    type="tel"
                    value={createFormData.phone}
                    onChange={handleCreateFormChange}
                    placeholder="Phone number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="create_address">Address</Label>
                  <Input
                    id="create_address"
                    name="address"
                    value={createFormData.address}
                    onChange={handleCreateFormChange}
                    placeholder="Address"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeModals}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#1F9BB7] hover:bg-[#1a8a9f] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event Planner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
