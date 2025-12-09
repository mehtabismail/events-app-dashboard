"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useUsers, User, GetUsersParams } from "@/components/useUsers";
import { useUpdateUser, UpdateUserParams } from "@/components/useUpdateUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users2,
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
  User as UserIcon,
} from "lucide-react";

type RoleFilter = "all" | "user" | "event-planner";

// Separate component that uses useSearchParams - must be wrapped in Suspense
function DashboardUsersContent() {
  const searchParams = useSearchParams();

  // Filter states - check for role query parameter
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(
    (searchParams.get("role") as RoleFilter) || "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState<UpdateUserParams>({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
    phone: "",
    address: "",
  });

  // Hooks - use roleFilter from state (which may come from query param)
  const { users, loading, error, pagination, refetch, setUsers } = useUsers({
    page: 1,
    limit: 12,
    role: roleFilter,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { updateUser, loading: updateLoading } = useUpdateUser();

  // Fetch users when filters change
  const handleFetchUsers = (params?: Partial<GetUsersParams>) => {
    const fetchParams: GetUsersParams = {
      page: params?.page ?? currentPage,
      limit: 12,
      role: params?.role ?? roleFilter,
      search: params?.search ?? (searchTerm || undefined),
      sortBy: params?.sortBy ?? sortBy,
      sortOrder: params?.sortOrder ?? sortOrder,
    };
    refetch(fetchParams);
  };

  // Handle query parameter changes on mount
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (
      roleParam &&
      (roleParam === "all" ||
        roleParam === "user" ||
        roleParam === "event-planner")
    ) {
      const role = roleParam as RoleFilter;
      setRoleFilter(role);
      setCurrentPage(1);
      refetch({
        page: 1,
        limit: 12,
        role: role,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    }
  }, [searchParams, refetch]);

  // Handle role filter change
  const handleRoleFilter = (role: RoleFilter) => {
    setRoleFilter(role);
    setCurrentPage(1);
    handleFetchUsers({ role, page: 1 });
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    handleFetchUsers({ search: searchTerm || undefined, page: 1 });
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
    handleFetchUsers({ page: newPage });
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);
    handleFetchUsers({ sortBy: field, sortOrder: newOrder });
  };

  // Open view modal
  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (user: User) => {
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

  // Close modals
  const closeModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
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
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === selectedUser._id ? updatedUser : u))
      );
      closeModals();
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "event-planner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "user":
        return "User";
      case "event-planner":
        return "Event Planner";
      default:
        return role;
    }
  };

  // Role filter options
  const roleFilters = [
    {
      value: "all" as RoleFilter,
      label: "All",
      icon: Users2,
      color:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      value: "user" as RoleFilter,
      label: "Users",
      icon: UserIcon,
      color:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200",
    },
    {
      value: "event-planner" as RoleFilter,
      label: "Event Planners",
      icon: UserCog,
      color:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200",
    },
  ];

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
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
            Error Loading Users
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button
            onClick={() => handleFetchUsers()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Users Management
          </h1>
          <p className="text-gray-500 dark:text-gray-300">
            Manage and view all users and event planners in your system
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => handleFetchUsers()}
              variant="outline"
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {pagination?.totalUsers || 0} user
              {(pagination?.totalUsers || 0) !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-4 relative z-0">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 relative z-0">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10 w-full relative z-0"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white relative z-0"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 relative z-0">
            <div className="flex flex-wrap items-center gap-2">
              {roleFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = roleFilter === filter.value;
                const count =
                  filter.value === "all"
                    ? pagination?.totalUsers || 0
                    : users.filter((u) => u.role === filter.value).length;
                return (
                  <button
                    key={filter.value}
                    onClick={() => handleRoleFilter(filter.value)}
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
                    <Icon className="w-4 h-4" />
                    <span>{filter.label}</span>
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
                      {filter.value === "all"
                        ? pagination?.totalUsers || 0
                        : count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-20">
          {users.map((user, index) => (
            <div
              key={user._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in overflow-hidden relative z-20 isolate"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* User Header with Avatar */}
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 pb-12 z-0">
                <div className="absolute top-3 right-3 z-20">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <div className="relative -mt-10 flex justify-center z-10">
                <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 relative z-10">
                  {user.photo ? (
                    <Image
                      src={user.photo}
                      alt={`${user.first_name} ${user.last_name}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => openViewModal(user)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => openEditModal(user)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Users2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Users Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm
                ? `No users match "${searchTerm}". Try a different search term.`
                : "There are no users to display at the moment."}
            </p>
            <Button
              onClick={() => handleFetchUsers()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalUsers} total users)
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

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-modal-in">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 pb-16 rounded-t-2xl">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white">User Details</h3>
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
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
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
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                    selectedUser.role
                  )}`}
                >
                  {getRoleDisplayName(selectedUser.role)}
                </span>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedUser);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
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
            <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 rounded-t-2xl">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <p className="text-white/80 text-sm mt-1">
                Update user information for {selectedUser.first_name}{" "}
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
                      Update User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS Animations */}
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
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Main component with Suspense boundary
export default function DashboardUsers() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      }
    >
      <DashboardUsersContent />
    </Suspense>
  );
}
